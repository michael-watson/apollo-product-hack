import { RESTDataSource } from 'apollo-datasource-rest';

export class jsonServiceDatasource extends RESTDataSource {
	constructor() {
		super();
		this.baseURL = 'http://localhost:8000/';
	}

	async getUserProducts(email: String) {
		return await this.get(`suggestedProducts?email=${email}`, {}, { cacheOptions: { ttl: 60 } });
	}
};