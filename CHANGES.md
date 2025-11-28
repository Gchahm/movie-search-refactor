### CHANGES — Audit and Fixes Since Initial Import (up to HEAD)

This document summarizes the issues identified and the fixes/refactors applied across the repository history starting from the initial import (900925e) through subsequent commits. It maps the original challenge goals to concrete changes in this codebase.

#### Summary of Key Improvements
- Stabilized favorites handling and pagination across backend and frontend.
- Centralized API access to OMDb and standardized error handling/messages.
- Added robust validation (DTOs/Zod), improved type safety across packages, and migrated types to a shared `types` workspace.
- Improved UI/UX for empty states, broken images, loading/favorite toggles, and URL-driven navigation.
- Reduced duplication and tightened component and hook responsibilities.

---

### Issues Found and How They Were Fixed

#### 1) Missing/weak validation and inconsistent error handling (Backend)
- Issue: Controller endpoints accepted unvalidated inputs (e.g., missing/invalid `imdbID`, page, query strings), leading to hidden runtime errors and inconsistent responses.
- Fixes:
  - Introduced DTOs and enabled global `ValidationPipe` with whitelist to strip unknown properties. (301c44f, d6ec2f2, 3ab491b, 8130abe)
  - Improved controller methods to return consistent error messages and HTTP semantics. (301c44f)
  - Centralized error handling utilities and standardized API error messaging. (91e4677)

#### 2) Favorites logic errors and case-sensitivity bugs
- Issue: Favorites were stored/looked up with case-sensitive IMDb IDs causing duplicates/misses. Rapid toggles could cause racey UI state.
- Fixes:
  - Extracted `FavoritesStorageService` with normalized, case-insensitive IMDb ID handling. (0db45ac, 2d91a1a)
  - Added paginated favorites API and page size support; improved list consistency. (3b3e2da)
  - Propagated `isFavorite` to movie responses and UI; added `isFavoriteLoading` to avoid rapid-click issues. (3b30d36, a3bbc2e)

#### 3) OMDb API usage scattered and weakly typed
- Issue: Direct fetch calls with ad-hoc parsing and minimal error checks; inconsistent env configuration and page size math.
- Fixes:
  - Introduced `OmdbClientService` to centralize requests, validation, and retries. (7baa5dc, cd77462)
  - Migrated API response parsing to typed paths; added total-pages calculation based on configured OMDb page size. (cd77462, ae03e95)
  - Replaced hardcoded env vars with `getEnvConfig` and dynamic config usage. (7baa5dc)

#### 4) Type safety gaps and duplication across apps
- Issue: Divergent movie types between backend and frontend; brittle casting; missing fields.
- Fixes:
  - Created shared `types` package and migrated type definitions; updated imports across the repo. (c174b30, 98e42ab)
  - Added optional `isFavorite` on `Movie` schema; improved DTOs and Zod schemas for runtime validation. (3b30d36, ae03e95)

#### 5) Pagination and URL state sync bugs (Frontend)
- Issue: Page index lost on navigation; query/page not synced to the URL; edge cases with out-of-range/invalid pages.
- Fixes:
  - Extracted `useCurrentPage` and `replaceSearchParams` utilities to manage URL-driven pagination safely. (5189684, d210dd6)
  - Validated page numbers and guarded scrolling behavior for SSR/No-DOM. (3101543)
  - Fixed pagination component accessibility and logic. (b2b183f)
  - Synced query and pagination with URL and improved navigation handling in search components. (feefb8c)

#### 6) Robustness in UI components
- Issue: Broken poster images causing layout issues; favorite toggles jittery under rapid clicks.
- Fixes:
  - Added error fallback and lazy-loading for images. (a81a090)
  - Extracted `MovieCardContainer` to centralize toggle logic and loading flags, reducing double-click issues. (c1e3e4f, a3bbc2e)

#### 7) Query/mutation management inefficiencies
- Issue: Over-invalidation and redundant rerenders in hooks.
- Fixes:
  - Optimized query invalidation and extracted `useInvalidateQueries` for route-specific logic. (d254823)
  - Cleaned/typed hooks; added retry logic and error handling paths. (f5c0eb6)

#### 8) General refactors and consistency
- Issue: Mixed code styles, unused imports, scattered responsibilities.
- Fixes:
  - Cleaned unused imports, unified quote style/formatting. (18c6ab4, 2d8b6ea, 368621e)
  - Extracted/removed redundant components, simplified page logic. (66110c5, 37d8fca, c2b590f)
  - Consolidated backend logic and response shaping in `MoviesService`. (c2b590f, cd77462)

---

### Backend Highlights
- Favorites storage service with pagination, case-insensitive keys, and DTO-driven validation. (0db45ac, 3b3e2da, 2d91a1a)
- Omdb client abstraction with typed models and error handling; config-driven page size in page math. (7baa5dc, cd77462)
- ValidationPipe whitelist enabled globally; stricter DTOs for queries/params. (d6ec2f2, 301c44f)

### Frontend Highlights
- URL-synced search and pagination; extracted hooks/utilities. (feefb8c, 5189684, d210dd6)
- Better image handling and accessibility improvements in pagination. (a81a090, b2b183f)
- Stronger typing and error surfaced in hooks; improved UX for loading/favorite toggles. (f5c0eb6, a3bbc2e)

### Validation & Type Safety
- Shared `types` workspace with Zod schemas for runtime validation and TypeScript types for compile-time safety. (c174b30, ae03e95)
- DTOs across backend endpoints to validate query/params/body, with tests for validation error cases. (8130abe)

### Performance & UX
- Reduced unnecessary re-renders via targeted query invalidation and extracted containers. (d254823, c1e3e4f)
- Debounced/stable interactions for favorites; minimized layout shifts on image failures. (a3bbc2e, a81a090)

### Known Edge Cases Addressed
- Empty search results and invalid page indices now return stable UI states and accurate counts/pages. (3101543, b2b183f, feefb8c)
- Network/API errors now display consistent messages and avoid throwing unhandled exceptions. (91e4677, f5c0eb6)

### Notable Files/Areas
- Backend: `backend/src/movies/movies.service.ts`, `favorites-storage.service.ts`, `omdb-client.service.ts`, DTOs under `backend/src/movies/dto/`, and `config/env.config`.
- Frontend: extracted hooks for page/query state, `MoviesList`, `MovieCardContainer`, `SearchPage`, and `ErrorView`.
- Shared types: `types/src/movie.types.ts` and Zod schemas.

### Commit References (Selected)
- 0db45ac, 2d91a1a — Favorites service and case-insensitive handling
- 3b3e2da — Favorites pagination and `pageSize`
- 7baa5dc, cd77462 — OMDb client integration and typing
- d6ec2f2, 301c44f, 3ab491b — Validation pipe and DTO validations
- c174b30, ae03e95, 3b30d36 — Shared types + Zod validation
- 5189684, d210dd6, feefb8c — Pagination & URL sync utilities
- a81a090 — Poster error handling and lazy loading
- a3bbc2e, c1e3e4f — Favorite toggle loading state and container
- d254823, f5c0eb6 — Query invalidation and hook hardening
- b2b183f, 3101543 — Pagination and page guards/accessibility
- 91e4677 — Centralized error handling utilities

### Final Status
The codebase now demonstrates improved reliability, clearer responsibilities, stricter validation, and better UX. Remaining work would focus on expanding automated test coverage (unit/integration/e2e), load testing OMDb error scenarios, and documenting API contracts for consumers.
