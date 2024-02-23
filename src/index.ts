import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { StackController } from '@Controllers/StackController'
import { db, migrate } from '@Database/cronFactory'
import { CronService } from '@Services/CronService'
import { errorHandler } from '@Util/errorHandler'
import { TelegramMsgr } from '@Services/TelegramMsgr'

console.log('Running migrations...')
await migrate(db, {
	migrationsFolder: './migrations'
})

console.log(`Initializing existing CRON tasks...`)
await CronService.cronInit()

const app = new Hono({
	strict: false
})

app.use('*', cors())

new StackController(app, '/stack')

app.post('/testhook', async (c) => {
	await TelegramMsgr.sendMessage(
		'-4129652962',
		`Cron triggered, payload:\n<code>${JSON.stringify(await c.req.json())}</code>`
	)

	return c.text('OK')
})

app.onError(errorHandler)

const port = Number.isNaN(+process.env.PORT) ? 3000 : +process.env.PORT

console.log(`Listening to port ${port}`)

export default {
	port,
	fetch: app.fetch
}
