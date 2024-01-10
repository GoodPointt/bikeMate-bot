import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { TasksService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { NotifyController } from './notify/notify.controller';
import { WeatherService } from './bot/weather/weather.service';
import { BotUpdate } from './bot/bot.update';
import { NotifyService } from './notify/notify.service';

@Module({
	imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), BotModule],
	controllers: [NotifyController],
	providers: [AppService, TasksService, NotifyService],
})
export class AppModule {}
