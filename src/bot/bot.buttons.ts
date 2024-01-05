import { Chain } from '@prisma/client';
import { Markup } from 'telegraf';

export function menuButtons() {
	return Markup.keyboard(
		[
			Markup.button.callback('⛓️Ланцюги', 'chain'),
			Markup.button.callback('🌦️Погода', 'weather'),
		],
		{ columns: 2 },
	).resize();
}

export function chainEditButtons(id: number | string) {
	return Markup.inlineKeyboard(
		[
			Markup.button.callback('✅Встановити', `activate_${id.toString()}`),
			Markup.button.callback('❌Видалити', `delete_${id.toString()}`),
			Markup.button.callback('🚴Додати пробіг', `edit_${id.toString()}`),
		],
		{ columns: 2 },
	);
}
export function chainAddButton() {
	return Markup.inlineKeyboard([Markup.button.callback('➕Додати', 'add')]);
}

export function chainMenuButtons(chains: Chain[]) {
	return Markup.inlineKeyboard(
		chains.map(({ id, chainTitle, km, isCurrent }) =>
			Markup.button.callback(
				`${isCurrent ? '🟢' : '⭕'} {${id}} ${chainTitle} [${km}км]`.trim(),
				`open_${id.toString()}`,
			),
		),
		{ columns: 1 },
	);
}
