import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotifyService } from './notify/notify.service';

@Injectable()
export class TasksService extends NotifyService {
	@Cron('*/14 * * * *')
	async handleCron() {
		const notify = await this.checkNotify();
		console.log(notify);
	}
}
