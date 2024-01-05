import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { ChainService } from './chain.service';
import { PrismaService } from 'src/prisma.service';
import * as LocalSession from 'telegraf-session-local';

const sessions = new LocalSession({
	database: 'session_db.json',
});

@Module({
	imports: [
		TelegrafModule.forRoot({
			middlewares: [sessions.middleware()],
			token: process.env.BOT_API_TOKEN,
		}),
	],
	providers: [BotUpdate, ChainService, PrismaService],
})
export class BotModule {}
