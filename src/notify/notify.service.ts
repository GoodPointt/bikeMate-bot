import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BotUpdate } from '../bot/bot.update';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotifyService {
	constructor(private readonly botUpdate: BotUpdate) {}

	async notifyMessage(dto: NotificationDto) {
		const message = `Received new letter from: 
		\n🙂name: ${dto.name}
		\n📧email: ${dto.email}
		`;
		return await this.botUpdate.sendMessage(message);
	}

	async checkNotify(): Promise<string> {
		try {
			const response = await axios.get(process.env.HOST_URL + '/notify');
			return response.data;
		} catch (error) {
			console.error('Error when checking notify:', error);
			throw error;
		}
	}
}
