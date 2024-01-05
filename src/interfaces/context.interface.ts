import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
	session: {
		chainId?: number;
		telegramId?: string;
		type?: 'add_km' | 'add_chain';
	};
	message: any;
}
