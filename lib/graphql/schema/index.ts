import { scalarsTypeDefs } from './scalars'
import { userTypeDefs } from './user'
import { artistTypeDefs } from './artist'
import { exhibitionTypeDefs } from './exhibition'
import { eventTypeDefs } from './event'
import { galleryTypeDefs } from './gallery'
import { paginationTypeDefs } from './pagination'
import { inputsTypeDefs } from './inputs'
import { rootTypeDefs } from './root'

/**
 * GraphQL Schema Definition
 *
 * Complete GraphQL schema for ASCA (Asian Calligraphy Association)
 * Split into domain fragments; Apollo Server merges DocumentNode arrays
 * automatically.
 */
export const typeDefs = [
  scalarsTypeDefs,
  userTypeDefs,
  artistTypeDefs,
  exhibitionTypeDefs,
  eventTypeDefs,
  galleryTypeDefs,
  paginationTypeDefs,
  inputsTypeDefs,
  rootTypeDefs,
]
