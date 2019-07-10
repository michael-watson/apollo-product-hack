const jsonServiceDatasource = require('../datasources/jsonServiceDatasource');
const { ApolloServer, gql, AuthenticationError } = require('apollo-server-azure-functions');

const typeDefs = gql`
	type Query {
		me: User
	}
	type User {
		email: String!
		sugProducts: [Product]
	}
	type Product {
		name: String
		shortDesc: String
		price: Float
		inStock: Boolean
	}
`;

const resolvers = {
	Query: {
		me: async (root, { start, take }, context) => {
			let email = context.email;
			if (email) {
				let results = await context.dataSources.jsonServiceDatasource.getUserProducts(email);
				return {email: email, sugProducts: results};
			} else {
				return new AuthenticationError();
			}
		}
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	dataSources: () => ({
		jsonServiceDatasource: new jsonServiceDatasource()
	}),
	context: ({ request, context }) => ({
		email: request.headers.email
	}),
	cors: {
        origin: '*',            // <- allow request from all domains
		credentials: false
	}
});

module.exports = server.createHandler();