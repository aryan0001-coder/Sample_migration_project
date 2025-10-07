import { pgTable, serial, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // New column
  createdAt: timestamp('created_at').defaultNow(),
});