import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { tenants, users } from './schema';
import { eq } from 'drizzle-orm';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// Example: Insert and query data
async function main() {
  try {
    // Insert a tenant
    const tenant = await db.insert(tenants).values({
      name: 'Acme Corp',
    }).returning({ id: tenants.id });

    const tenantId = tenant[0].id;

    // Set tenant context for RLS (if enabled)
    await pool.query(`SET app.current_tenant_id = '${tenantId}'`);

    // Insert a user for the tenant
    await db.insert(users).values({
      tenantId, // Fixed from tenantID
      name: 'John Doe',
      role: 'admin', // Include new role column
    });

    // Query users for the tenant
    const tenantUsers = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role, // Select new role column
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.tenantId, tenantId)); // Fixed from tenantID

    console.log('Users for tenant:', tenantUsers);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();