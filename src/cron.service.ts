import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HealthService } from './health/health.service';

@Injectable()
export class TasksService extends HealthService {
	@Cron('*/14 * * * *')
	async handleCron() {
		const health = await this.checkHealth();
		console.log(health);
	}
}
