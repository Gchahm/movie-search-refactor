import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi } from '@/lib/api';

// BUG: Missing proper TypeScript types
export const useSearchMovies = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: query.length > 0,
    // BUG: No error handling configuration
    // BUG: No retry configuration
  });
};

export const useFavorites = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'favorites', page],
    queryFn: () => movieApi.getFavorites(page),
    // BUG: No error handling - will crash on 404
    // BUG: Should handle empty favorites gracefully
    // BUG: No retry logic - if backend throws 404 for empty list, query fails permanently
    // BUG: Query doesn't refetch when favorites are added/removed from other components
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onSuccess: () => {
      // BUG: Inefficient - invalidating all queries
      // BUG: Invalidates search queries too, causing unnecessary refetches
      // BUG: Should only invalidate favorites list and current search results
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    // BUG: No error handling
    // BUG: If backend returns HttpException object (not thrown), mutation succeeds but UI doesn't update
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onSuccess: () => {
      // BUG: Inefficient - invalidating all queries
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    // BUG: No error handling
  });
};

