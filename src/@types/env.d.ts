declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'build' | 'production'
			TELEGRAM_BOT_TOKEN: string
			DATABASE_URL: string
			DATABASE_AUTH_TOKEN: string
			PORT: string
		}
	}
}

export {}
