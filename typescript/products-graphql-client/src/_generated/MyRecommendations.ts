/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MyRecommendations
// ====================================================

export interface MyRecommendations_me_sugProducts {
  __typename: "Product";
  name: string | null;
  shortDesc: string | null;
  price: number | null;
  inStock: boolean | null;
}

export interface MyRecommendations_me {
  __typename: "User";
  sugProducts: (MyRecommendations_me_sugProducts | null)[] | null;
}

export interface MyRecommendations {
  me: MyRecommendations_me | null;
}
