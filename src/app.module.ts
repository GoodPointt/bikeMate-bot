import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { PrismaService } from './prisma.service';

@Module({
	imports: [ConfigModule.forRoot(), BotModule],
	controllers: [],
	providers: [AppService],
})
export class AppModule {}
