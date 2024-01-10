import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotificationDto } from './dto/notification.dto';

@Controller('notify')
export class NotifyController {
	constructor(private readonly notifyService: NotifyService) {}

	@Get()
	async getNotify(): Promise<string> {
		return '🚴🌈🌦️👻👾💖✨';
	}

	@Post()
	async notifyMessage(@Body() dto: NotificationDto) {
		return await this.notifyService.notifyMessage(dto);
	}
}
