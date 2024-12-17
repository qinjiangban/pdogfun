import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const ENDPOINT = "https://api.testnet.lens.dev/graphql";

const client = new ApolloClient({
  uri: ENDPOINT,
  cache: new InMemoryCache(),
});
export default client
