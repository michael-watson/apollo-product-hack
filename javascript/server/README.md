## Javascript walkthrough

### Server portion

1. First we'll need to create our server in the most simplest form we can. We'll transfer it over to Azure Functions to host later on. Let's setup a new server project:

```shell
mkdir lost-coast-apollo-server
cd lost-coast-apollo-server
mkdir src
>src/index.js
npm init 
```

2. Now we'll need to install our packages for GraphQL and Apollo Server:

```shell
npm install graphql apollo-server
```

3. Now let's open our `index.js` file and build out our server:

	* Add imports

	```javascript
	const resolvers = require('./resolvers/');
	const jsonServiceDatasource = require('./datasources/jsonServiceDatasource');
	const { ApolloServer } = require('apollo-server');
	```

	* Define Schema:

	```javascript
	
	```