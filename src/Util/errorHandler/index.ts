import { HTTPException } from 'hono/http-exception'

import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse()
	}

	console.error(`Error on ${c.req.method} ${c.req.url} :`)
	console.error(err)
	return c.json({ message: 'Something went wrong. Try again later...' }, 500)
}
