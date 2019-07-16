# Hackathon walkthrough

In this hackathon, we're going to take the example of an existing e-commercce application that we will create a GraphQL proof of concept for. We recommend you start out with one feature of your application and creating a schema that would serve that data. 

## Use case

For our first GraphQL feature, we're going to use the Recommended Products List that is displayed to our users (we'll ignore the styling for this POC)

![image](recommended-products-list.png)

Now we need to design on GraphQL schema which can be challenging sometimes. One of the big advantages of GraphQL is having the ability to break the tight coupling between consumers and provider of the data served by your GraphQL server. I recommend you start with the ideal schema for the consumers of data and work towards that. Below is an example of the ideal query for our feature:

![image](recommended-products.png)

## Getting started

### Setup

1. We're going to use [json-server]() for the fake REST API that we'll connect with. Let's set that project up:

```shell
mkdir products-json-server
cd products-json-server
npm install -g json-server
>db.json
code db.json
```

2. Then we'll need to create a structure:

```json
{
	"suggestedProducts": [
		{
			"email": "testymctest@test.com",
			"name": "Product A",
			"shortDesc": "Product description",
			"price": 1.99,
			"inStock": true
		},
		{
			"email": "testymctest@test.com",
			"name": "Product B",
			"shortDesc": "Product description",
			"price": 10.00,
			"inStock": false
		}
	]
}
```

3. Now let's run the json-server in the background

```shell
json-server --watch db.json --port 8000
```

### Exposing our first GraphQL schema

1. First we'll need to create our server in the most simplest form we can. We'll transfer it over to Azure Functions to host later on. Let's setup a new server project:

```shell
mkdir products-apollo-server
cd products-apollo-server
mkdir src
>src/index.ts
npm init 
tsc --init
```

Make sure to modify your `tsconfig.json` to have `"sourceMap": true` and `"outDir": "./dist"`. `sourceMap` is required for debugging TypeScript projects.

2. Now we'll need to install our packages for GraphQL and Apollo Server:

```shell
npm install graphql apollo-server apollo-datasource-rest 
npm install --save-dev @types/node @types/graphql
```

3. Now let's create our first data source:

```shell
mkdir datasources
>datasources/jsonServiceDatasource.ts
code datasources/jsonServiceDatasource.ts
```

3a. Apollo Server has the `RESTDataSource` built into it that has CRUD methods implemented for you to easily expose a REST API.

```javascript
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
```

4. Now let's open our `index.ts` file and build out our server:

	* Add imports

	```javascript
	const { ApolloServer, gql, AuthenticationError } = require('apollo-server');
	const jsonServiceDatasource = require('./datasources/jsonServiceDatasource');
	```

	* Define Schema:

	```typescript
	const typeDefs = gql`
		type Query {
			me: User!
		}
		type User {
			email: String!
			sugProducts: [Product!]!
		}
		type Product {
			name: String!
			shortDesc: String
			price: Float
			inStock: Boolean
		}
	`;
	```

	* Define Resolvers:

	```javascript
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
	```

	* Create your server:

	```javascript
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		dataSources: () => ({
			jsonServiceDatasource: new jsonServiceDatasource()
		}),
		context: ({ request, context }) => {
			let req = context.req;
			if (req) {
				return { email: req.headers.email };
			}
		}
	});
	```

	* Have our server listen for requests:

	```javascript
	server.listen().then(({ url }) => {
		console.log(`🚀  Server ready at ${url}`);
	});
	```

5. Now let's click over to the debug tab of VS Code and add a launch configuration. You can manually create a `.vscode` folder in the root with a `lanuch.json` if the *Add Configuration* in VS Code doesn't work for some reason:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "Launch Program",
			"program": "${workspaceFolder}/products-apollo-server/src/index.ts",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "outFiles": [
                "${workspaceFolder}/products-apollo-server/dist/**/*.js"
            ]
		}
	]
}
```

6. Click the play button to start up your server

7. Navigate to [http:/localhost:4000](http:/localhost:4000)

### Moving the project into Azure Functions

1. Let's create a new folder and initialize the project with the VS Code extension for Azure Functions

![image](Create-new-azure-function.png)

2. Walk through the selection and create a TypeScript function with an `HttpTrigger` named `graphql` and `Anonymous`.

3. We'll need to copy our `datasources` folder into the root of this project

4. Next we'll need to replace our `index.ts` with what we previously created. 

5. Now we'll need to install the `apollo-server-azure-functions` package to get the handler:

```shell
npm install graphql apollo-server apollo-server-azure-functions apollo-datasource-rest apollo-server-azure-functions
npm install --save-dev @types/node @types/graphql
```

6. We'll need to change our imports statement:

```typescript
import { ApolloServer, gql, AuthenticationError } from 'apollo-server-azure-functions';
```

7. We'll need to change the `context` function in the `ApolloServer` constructor because of how Azure Functions handles the context:

```typescript
context: ({ request, context }) => {
	let req = context.req;
	if (req) {
		return { email: req.headers.email };
	}
}
```

8. Now we'll just need to remove our listener and export our Apollo Server handler for Azure Functions:

```typescript
let graphqlHandler = server.createHandler();

export default graphqlHandler;
```

9. Now we'll need our `HttpTrigger` to support returning GraphQL Playground. Open the `function.json` and modify what it returns to be like below:

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ],
  "scriptFile": "../dist/graphql/index.js"
}
```

9 - optional. I like to make my GraphQL endpoints not have `api`. If you feel the same, open the `host.json` and make it so:

```json
{
	"version": "2.0",
	"extensions": {
		"http": {
			"routePrefix": ""
		}
	}
}
```

10. Last we'll need to setup CORS for our local settings (this is also where you can change the port). Open your `local.settings.json` file:
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*"
  }
}
```

11. Open debug tab and press play button. You should see the url print in the integrated console to open.

11 - optional. Try hosting in Azure Functions with the VS Code extension. It's very easy to push into the cloud, but you'll need to change your `index.ts` to provide mocked data:

```typescript
import { ApolloServer, gql, AuthenticationError } from 'apollo-server-azure-functions';

const typeDefs = gql`
	type Query {
		me: User!
	}
	type User {
		email: String!
		sugProducts: [Product!]!
	}
	type Product {
		name: String!
		shortDesc: String
		price: Float
		inStock: Boolean
	}
`;

const server = new ApolloServer({
	typeDefs,
	mocks: true,
	context: ({ request, context }) => {
		let req = context.req;
		if (req) {
			return { email: req.headers.email };
		}
	}
});


let graphqlHandler = server.createHandler();

export default graphqlHandler;

```

### Moving on to the client section

Now that we have a server running with our GraphQL Schema, let's create the client application.

1. Create the shell react app:

```shell
mkdir products-graphql-client
cd products-graphql-client
npx create-react-app .
mkdir src/components
npm install graphql graphql-tag apollo-client apollo-cache-inmemory apollo-link-context apollo-link-http react-apollo
npm install @types/react @types/graphql --save-dev
```

2. Let's add our Apollo Client to our project, open up the index.js and change it to be like below :

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { ApolloProvider } from 'react-apollo';

const httpLink = new HttpLink({ uri: 'http://localhost:7071/graphql' });

const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			email: "testymctest@test.com"
		}
	}
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    name: 'ecommerce-web',
    version: '1.0'
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root'));
```

3. One of the benefits of using TypeScript is type safety. The Apollo CLI can generate your TypeScript types either based on a locally defined schema or a remote endpoint. Let's generate our types using the Apollo CLI:

```shell
npx apollo client:codegen --endpoint=http://localhost:7071/graphql --target=typescript --outputFlat=src/_generated/
```

**Note**: We'll have to delete the `globalTypes.ts` that was generated since we don't have any global types generated. Otherwise the empty file will show up in our *Problems* tab.

4. Now we're going to create our first component that will use a GraphQL query:

```shell
>src/components/RecommendedProductsList.tsx
```

5. Add our imports and query to the component:

```typescript
import React from 'react';
import { Query } from 'react-apollo';
import { ApolloError } from 'apollo-client';
import gql from 'graphql-tag';
import { MyRecommendations, MyRecommendations_me_sugProducts } from '../_generated/MyRecommendations';

const RecommendedProductsQuery = gql`
	query MyRecommendations {
		me {
			sugProducts {
				name
				shortDesc
				price
				inStock
			}
		}
	}
`;
```

6. Now we'll need to create an interface for typesafety that uses our generated type. We'll also have to create an associated View that utilizes the data returned from our GraphQL query: 

```typescript
interface IProductsViewProps {
	myRecommendations: MyRecommendations | undefined;
	error?: ApolloError;
	loading: boolean;
}

const RecommendedProductsListView = ({ myRecommendations, error, loading }: IProductsViewProps) => {
	if (loading) {
		return <div>LOADING </div>
	} else if (myRecommendations) {
		return (
			<ul className="productList">
				{myRecommendations.me.sugProducts.map((product: MyRecommendations_me_sugProducts) => (
					<li key={product.name}>
						<div>
							<p><b>{product.name}</b> ${product.price}<br />{product.inStock ? "In Stock" : "Not in stock"}</p>
							{product.shortDesc}
						</div>
					</li>
				))}
			</ul>
		);
	} else if (error) {
		return <div>ERROR: {error.message} </div>
	} else {
		return <div>ERROR</div>
	}
};
```

7. Lastly, we'll just need to extend our `Query` from `react-apollo` and wire everything up:

```typescript
class ProductsQuery extends Query<MyRecommendations, {}> { }

const RecommendedProductsList = () => (
	<ProductsQuery query={RecommendedProductsQuery} >
		{({ data, error, loading }) => (
			<RecommendedProductsListView
				myRecommendations={data}
				error={error}
				loading={loading}
			/>
		)}
	</ProductsQuery>
);

export default RecommendedProductsList;
```

5. Now add our component to the application, open our `App.js`:

```javascript
import React from 'react';
import './App.css';

import RecommendedProductsList from './components/RecommendedProductsList';

function App() {
  return (
    <div className="App">
      <RecommendedProductsList/>
    </div>
  );
}

export default App;
```

6. Now let's start our app and check it out!

```shell
npm run start
```