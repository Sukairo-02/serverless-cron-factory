export class TelegramMsgr {
	private static botToken = process.env.TELEGRAM_BOT_TOKEN

	public static async sendMessage(recepient: string | number, message: string) {
		try {
			await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: recepient,
					text: message
				})
			})
		} catch (e) {
			console.error(e)
		}
	}
}
