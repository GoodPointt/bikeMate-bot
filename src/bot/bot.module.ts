import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { ChainService } from './chain/chain.service';
import { PrismaService } from 'src/prisma.service';
import * as LocalSession from 'telegraf-session-local';
import { WeatherService } from './weather/weather.service';

const sessions = new LocalSession({
	database: 'session_db.json',
});

@Module({
	imports: [
		TelegrafModule.forRoot({
			middlewares: [sessions.middleware()],
			token: process.env.BOT_API_TOKEN,
			options: { groupId: process.env.GROUP_ID } as any,
		}),
	],
	providers: [BotUpdate, ChainService, PrismaService, WeatherService],
	exports: [BotUpdate],
})
export class BotModule {}
