import { Context } from 'src/interfaces/context.interface';
import { chainAddButton, chainMenuButtons } from './bot.buttons';
import { Chain } from '@prisma/client';

export const listChains = async (
	ctx: Context,
	chains: Chain[],
	isNew: boolean = false,
) => {
	if (chains.length === 0) {
		await ctx.reply('🤭Упс в тебе поки немає ланцюгів.', chainAddButton());
	} else {
		await ctx.reply(`⛓️Твої ланцюги:`, chainMenuButtons(chains));
		if (isNew) {
			await ctx.reply('🆕Новий ланцюг', chainAddButton());
		}
	}
};
