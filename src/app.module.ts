import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { TasksService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';

@Module({
	imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), BotModule],
	controllers: [HealthController],
	providers: [AppService, TasksService],
})
export class AppModule {}
