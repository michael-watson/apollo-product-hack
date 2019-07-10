import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

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

export function RecommendedProductsList() {
	const { loading, data, error } = useQuery(RecommendedProductsQuery);
	if (loading) return <p className="loading">loading...</p>;
	if (error) return <p>ERROR</p>;

	return (
		<ul className="productList">
			{data.me.sugProducts.map(product => {
				return (
					<li key={product.name}>
						<div>
							<p><b>{product.name}</b><price>{product.price}<br />{product.inStock ? "In Sock" : "Not in stock"}</price></p>
							{product.shortDesc}
						</div>
					</li>
				)
			})}
		</ul>
	);
}
