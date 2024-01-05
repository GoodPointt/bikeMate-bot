import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
	@Get()
	async getHealth(): Promise<string> {
		return '🚴🌈🌦️👻👾💖✨';
	}
}
