import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { MyRecommendations } from '../_generated/MyRecommendations';

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

interface Data {
	allPeople: {
	  people: Array<{ id: string; name: string }>;
	};
  };

export const RecommendedProductsList: React.Component<{}, {}, any> = () => {
	return(
		<Query<Data,{}> query={RecommendedProductsQuery}>

		</Query>
	);
}

export default RecommendedProductsList;