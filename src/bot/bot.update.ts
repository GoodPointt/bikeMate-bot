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
import { ChainService } from './chain/chain.service';
import { chainEditButtons, locationButton, menuButtons } from './bot.buttons';
import { Context } from 'src/interfaces/context.interface';
import { listChains } from './bot.utils';
import { WeatherService } from './weather/weather.service';
import { handleWeatherCode } from './weather/waeather.utils';

@Update()
export class BotUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly chainService: ChainService,
		private readonly waetherService: WeatherService,
	) {}

	@Start()
	async start(@Ctx() ctx: Context) {
		await ctx.reply(
			`👋Вітаю, друже ${ctx.from.first_name}! \n\n🚴Що робимо?`,
			menuButtons(),
		);
	}

	async sendMessage(message: string) {
		const groupId = process.env.GROUP_ID;
		console.log(groupId);
		try {
			await this.bot.telegram.sendMessage(groupId, message);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	//WAETHER
	@Hears('🔙Назад до меню')
	async backToMenu(@Ctx() ctx: Context) {
		await ctx.reply('🚴Що робимо?', menuButtons());
	}
	@Hears('🌦️Погода')
	async askLocation(@Ctx() ctx: Context) {
		await ctx.reply('Де ти є❔', locationButton());
	}
	@On('location')
	async handleLocation(@Ctx() ctx: Context) {
		const location = ctx.message?.location;

		if (location) {
			const data = await this.waetherService.getWeatherLocationCoord(location);
			await ctx.reply(
				`✨ ${data.timezone}
      \n${handleWeatherCode(data.current_weather.weathercode)}
      \n🌡️ ${data.current_weather.temperature} ${
				data.hourly_units.temperature_2m
			}
      \n💨 ${data.current_weather.windspeed} ${
				data.hourly_units.windspeed_10m
			}`,
			);
		} else {
			console.log('Location data not found in the message.');
		}
	}

	//CHAINS
	@Hears('⛓️Ланцюги')
	async listChains(@Ctx() ctx: Context) {
		const telegramId = ctx.from.id.toString();
		const chains = await this.chainService.getChains(telegramId);
		await ctx.deleteMessage();
		await listChains(ctx, chains);
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

		const msgId = ctx.update?.callback_query?.message?.message_id;

		if (msgId) {
			await ctx.telegram.deleteMessage(ctx.chat!.id, msgId);
		}

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
				await listChains(ctx, chains);
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
				await listChains(ctx, chains);
			} else {
				await ctx.reply(`Не вдалося видалити ланцюг з ID ${chainId}.`);
				const chains = await this.chainService.getChains(telegramId);
				await listChains(ctx, chains);
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
				await listChains(ctx, chains);
			}
		}
	}
}
