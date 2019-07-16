const { RESTDataSource } = require('apollo-datasource-rest');

module.exports = class jsonServiceDatasource extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://localhost:8000/';
    }

    async getUserProducts(email)  {
        return await this.get(`suggestedProducts?email=${email}`, null, { cacheOptions: { ttl: 60 } });
    }
};