import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
	session: {
		chainId?: number;
		telegramId?: string;
		type?: 'add_km' | 'add_chain';
		prevMsgId?: string | number;
	};
	message: any;
	update: any;
	groupId: string;
}
