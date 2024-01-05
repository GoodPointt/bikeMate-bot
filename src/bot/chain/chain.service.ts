import { Injectable } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChainService {
	constructor(private readonly prisma: PrismaService) {}

	async getChains(telegramId: string): Promise<Chain[]> {
		try {
			const res = await this.prisma.chain.findMany({ where: { telegramId } });
			return res;
		} catch (error) {
			console.log(error);
		}
	}

	async openChain(telegramId: string, chainId: number): Promise<Chain> | null {
		try {
			const res = await this.prisma.chain.findFirst({
				where: { telegramId, id: chainId },
			});
			return res;
		} catch (error) {
			console.log(error);
		}
	}

	async addNewChain(
		telegramId: string,
		chainTitle: string,
	): Promise<Chain> | null {
		try {
			const res = await this.prisma.chain.create({
				data: { telegramId, chainTitle },
			});
			return res;
		} catch (error) {
			console.log(error);
		}
	}

	async editChain(
		telegramId: string,
		chainId: number,
		km?: number,
	): Promise<Chain | null> {
		if (!km) {
			try {
				const activatedChain = await this.prisma.chain.update({
					where: { telegramId, id: chainId },
					data: { isCurrent: true },
				});

				if (activatedChain) {
					await this.prisma.chain.updateMany({
						where: { id: { not: chainId }, telegramId },
						data: { isCurrent: false },
					});
					return activatedChain;
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			try {
				const currentChain = await this.prisma.chain.findUnique({
					where: { telegramId, id: chainId },
				});

				if (currentChain) {
					const newKm = currentChain.km + km;
					const editedChain = await this.prisma.chain.update({
						where: { telegramId, id: chainId },
						data: { km: newKm },
					});

					return editedChain;
				}
			} catch (error) {}
		}
	}

	async deleteChain(
		telegramId: string,
		chainId: number,
	): Promise<Chain> | null {
		try {
			const res = await this.prisma.chain.delete({
				where: { telegramId, id: chainId },
			});
			return res;
		} catch (error) {
			console.log(error);
		}
	}
}
