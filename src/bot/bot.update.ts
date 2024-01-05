import {
	Update,
	Ctx,
	Start,
	Help,
	On,
	Hears,
	InjectBot,
	Action,
	Message,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ChainService } from './chain.service';
import { chainEditButtons, menuButtons } from './bot.buttons';
import { Context } from 'src/interfaces/context.interface';
import { listChains } from './bot.utils';

@Update()
export class BotUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly chainService: ChainService,
	) {}

	@Start()
	async start(@Ctx() ctx: Context) {
		await ctx.reply(`👋Вітаю, друже ${ctx.from.first_name}!`);
		await ctx.reply('🚴Що робимо?', menuButtons());
	}

	@Hears('⛓️Ланцюги')
	async listChains(@Ctx() ctx: Context) {
		const telegramId = ctx.from.id.toString();
		const chains = await this.chainService.getChains(telegramId);
		await ctx.deleteMessage();
		await listChains(ctx, chains, true);
	}

	//NEW CHAIN
	@Action('add')
	async editChain(@Ctx() ctx: Context) {
		ctx.session.type = 'add_chain';
		await ctx.reply('Як назвати новий ланцюг❔');
	}

	@On('callback_query')
	async handleEditButton(@Ctx() ctx: Context) {
		const callbackData = (ctx.update as any)?.callback_query?.data;

		//OPEN ONE
		if (callbackData && callbackData.startsWith('open_')) {
			const telegramId = ctx.from.id.toString();
			const chainId = parseInt(callbackData.split('_')[1], 10);

			const openedChain = await this.chainService.openChain(
				telegramId,
				chainId,
			);

			if (openedChain) {
				await ctx.reply(
					`🔗${openedChain.isCurrent ? '🟢' : '⭕'} {${chainId}} ${
						openedChain.chainTitle
					} [${openedChain.km}км]`,
					chainEditButtons(chainId),
				);
			} else {
				await ctx.reply(`😔Не вдалося знайти ланцюг з ID ${chainId}.`);
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains, true);
			}
		}

		//ACTIVATE
		if (callbackData && callbackData.startsWith('activate_')) {
			const telegramId = ctx.from.id.toString();
			const chainId = parseInt(callbackData.split('_')[1], 10);

			const activatedChain = await this.chainService.editChain(
				telegramId,
				chainId,
			);

			if (activatedChain) {
				await ctx.reply(`✅Ланцюг з ID ${chainId} встановлено.`);

				const telegramId = ctx.from.id.toString();
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains);
			} else {
				await ctx.reply(`😔Не вдалось встановити ланцюг з ID ${chainId}.`);

				const telegramId = ctx.from.id.toString();
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains);
			}
		}

		//ADD KM
		if (callbackData && callbackData.startsWith('edit_')) {
			const telegramId = ctx.from.id.toString();
			const chainId = parseInt(callbackData.split('_')[1], 10);
			ctx.session = { telegramId, chainId, type: 'add_km' };
			await ctx.reply(`Скільки км додати❔`);
		}

		//DELETE
		if (callbackData && callbackData.startsWith('delete_')) {
			const telegramId = ctx.from.id.toString();
			const chainId = parseInt(callbackData.split('_')[1], 10);

			const deletedChain = await this.chainService.deleteChain(
				telegramId,
				chainId,
			);

			if (deletedChain) {
				await ctx.reply(`Ланцюг з ID ${chainId} видалено.`);
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains, true);
			} else {
				await ctx.reply(`Не вдалося видалити ланцюг з ID ${chainId}.`);
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains, true);
			}
		}
	}

	@On('text')
	async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
		if (ctx.session.type === 'add_km') {
			const numericMsg = parseInt(message, 10);
			const { telegramId, chainId } = ctx.session;
			const editedChain = await this.chainService.editChain(
				telegramId,
				chainId,
				numericMsg,
			);

			if (!editedChain)
				await ctx.reply(`😔Не вдалось оновити пробіг ланцюга з ID ${chainId}`);
			else {
				await ctx.deleteMessage();
				await ctx.reply(`✅Ланцюг з ID ${chainId} оновлено ➕${numericMsg}км.`);
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains);
			}
		}

		if (ctx.session.type === 'add_chain') {
			const telegramId = ctx.from.id;
			const addedChain = await this.chainService.addNewChain(
				telegramId.toString(),
				message.toString(),
			);

			if (!addedChain)
				await ctx.reply(`😔Не вдалось додати новий ланцюг ${message}`);
			else {
				await ctx.deleteMessage();
				await ctx.reply(`✅Ланцюг ${message} успішно додано`);
				const chains = await this.chainService.getChains(telegramId.toString());
				await listChains(ctx, chains, true);
			}
		}
	}
}
