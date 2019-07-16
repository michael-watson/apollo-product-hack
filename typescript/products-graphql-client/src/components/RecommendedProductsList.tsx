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

interface IProductsViewProps {
	myRecommendations: MyRecommendations | undefined;
	error?: ApolloError;
	loading: boolean;
}

const ProductsView = ({ myRecommendations, error, loading }: IProductsViewProps) => {
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

class ProductsQuery extends Query<MyRecommendations, {}> { }

const RecommendedProductsList = () => (
	<ProductsQuery query={RecommendedProductsQuery} >
		{({ data, error, loading }) => (
			<ProductsView
				myRecommendations={data}
				error={error}
				loading={loading}
			/>
		)}
	</ProductsQuery>
);

export default RecommendedProductsList;