import { queryResolvers } from './query.resolver';
import { mutationResolvers } from './mutation.resolver';
import { typeResolvers } from './types.resolver';

/**
 * Combined GraphQL Resolvers
 *
 * Exports all resolvers for the GraphQL server
 */

export const resolvers = {
  // Root queries
  Query: queryResolvers,

  // Root mutations
  Mutation: mutationResolvers,

  // Type resolvers (nested fields)
  ...typeResolvers,
};
