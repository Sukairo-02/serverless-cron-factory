import { primaryKey, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const Stack = sqliteTable('stack', {
	name: text('name').notNull().primaryKey(),
	owner: text('owner').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	password: text('password').notNull(),
	logTelegramId: text('log_telegram_id')
})

export const Task = sqliteTable(
	'task',
	{
		name: text('name').notNull(),
		stackName: text('stack_name')
			.notNull()
			.references(() => Stack.name, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			}),
		cron: text('cron_string').notNull(),
		url: text('url').notNull(),
		headers: text('headers', { mode: 'json' }).$type<Record<string, string>>(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date()),
		succesfullCalls: integer('calls').notNull().default(0),
		consecutiveFailures: integer('consecutive_failures').notNull().default(0),
		lastSuccesfullCall: integer('last_succesfull_call', { mode: 'timestamp_ms' })
	},
	(Task) => ({
		cpk: primaryKey({
			columns: [Task.name, Task.stackName]
		})
	})
)
