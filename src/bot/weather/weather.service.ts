import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
	async getWeatherLocationCoord({ longitude, latitude }) {
		const { data } = await axios.get(process.env.URL_API_WEATHER, {
			params: {
				latitude,
				longitude,
				hourly: 'temperature_2m,relativehumidity_2m,windspeed_10m',
				current_weather: true,
				timezone: 'auto',
			},
		});
		return data;
	}
}
