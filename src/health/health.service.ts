import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HealthService {
	async checkHealth(): Promise<string> {
		try {
			const response = await axios.get(process.env.HOST_URL + '/health');
			return response.data;
		} catch (error) {
			console.error('Error when checking health:', error);
			throw error;
		}
	}
}
