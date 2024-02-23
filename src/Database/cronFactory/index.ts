import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

export { migrate } from 'drizzle-orm/libsql/migrator'

export const db = drizzle(
	createClient({
		url: process.env.DATABASE_URL,
		authToken: process.env.DATABASE_AUTH_TOKEN
	})
)

export * from './schema'
export * from './types'
