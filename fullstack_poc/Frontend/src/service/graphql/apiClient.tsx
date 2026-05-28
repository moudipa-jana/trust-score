import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import captureSentryException from '@/lib/sentryException';

import store from '../../state/store';

export default class ApiClient {
  private static client: ApolloClient;

  public static createOrGetApolloClient() {
    if (ApiClient.client) {
      return ApiClient.client;
    }

    const headersVal = {};
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
      headers: headersVal,
    });

    const authLink = setContext((_, { headers }) => {
      const storeValue = store.getState();
      const authToken = storeValue.auth.token;
      const authHeaders =
        authToken && authToken.trim()
          ? { Authorization: `Bearer ${authToken.trim()}` }
          : {};
      return {
        headers: {
          ...headers,
          ...authHeaders,
        },
      };
    });

    // ✅ GraphQL WS Link (new way)
    const wsLink =
      typeof window !== 'undefined'
        ? new GraphQLWsLink(
          createClient({
            url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || '',
            connectionParams: async () => {
              const storeVal = store.getState();
              const authToken = storeVal.auth.token;
              if (!authToken) {
                captureSentryException(
                  new Error('Invalid token passed to ws link'),
                );
              }
              return {
                headers: {
                  Authorization: authToken ? `Bearer ${authToken}` : '',
                },
              };
            },
            retryAttempts: Infinity,
            lazy: true,
          }),
        )
        : null;

    // Split for subscriptions vs queries/mutations
    const splitLink =
      typeof window !== 'undefined' && wsLink
        ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return (
              def.kind === 'OperationDefinition' &&
              def.operation === 'subscription'
            );
          },
          wsLink,
          authLink.concat(httpLink),
        )
        : authLink.concat(httpLink);

    const newClient = new ApolloClient({
      ssrMode: typeof window === 'undefined',
      cache: new InMemoryCache(),
      link: splitLink,
    });

    ApiClient.client = newClient;
    return newClient;
  }

  public static getClient() {
    return ApiClient.createOrGetApolloClient();
  }

  public static initializeApollo() {
    return ApiClient.createOrGetApolloClient();
  }
}
