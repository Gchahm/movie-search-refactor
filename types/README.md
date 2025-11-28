# @movie-search/types

Shared TypeScript types for the movie-search application. This package is used by both the frontend and backend to ensure type consistency across the entire application.

## Installation

This package is part of the monorepo and is automatically linked via pnpm workspaces:

```json
{
  "dependencies": {
    "@movie-search/types": "workspace:*"
  }
}
```

## Usage

### Frontend (Next.js)

```typescript
import { Movie, SearchMoviesResponse, FavoritesResponse } from '@movie-search/types';

const movie: Movie = {
  title: "The Matrix",
  imdbID: "tt0133093",
  year: 1999,
  poster: "https://...",
  isFavorite: true
};
```

### Backend (NestJS)

```typescript
import { Movie, MovieDto } from '@movie-search/types';

export class MoviesService {
  async searchMovies(): Promise<Movie[]> {
    // implementation
  }
}
```

## Available Types

- `Movie` - Core movie interface
- `MovieDto` - Data transfer object for movie data
- `SearchMoviesResponse` - Response structure for movie search
- `FavoritesResponse` - Response structure for favorites list

## Development

Build the types package:

```bash
pnpm build
```

Watch for changes during development:

```bash
pnpm dev
```
