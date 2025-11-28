import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {movieApi} from '@/lib/api';
import {useCallback} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

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
        // BUG: Query doesn't refetch when favorites are added/removed from other components
    });
};

/**
 * Invalidate only the query corresponding to the current route and URL params
 * On "/" (search page): invalidates ['movies','search'] no way to tell what queries movie is present
 * On "/favorites": invalidates ['movies','favorites', page]
 */
export const useInvalidateQueries = () => {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const q = searchParams?.get('q') ?? '';
    const pageParam = searchParams?.get('page');
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    return useCallback(async () => {
        if (pathname === '/favorites') {
            await queryClient.invalidateQueries({queryKey: ['movies', 'favorites', page], exact: true});
            return;
        }
        if (pathname === '/') {
            await queryClient.invalidateQueries({queryKey: ['movies', 'favorites'], exact: true});
        }

        await queryClient.invalidateQueries({queryKey: ['movies', 'search'], exact: true});
    }, [pathname, q, page, queryClient]);
};

export const useAddToFavorites = () => {
    const invalidateCurrent = useInvalidateQueries();

    return useMutation({
        mutationFn: movieApi.addToFavorites,
        onSuccess: async () => {
            // Only invalidate the query corresponding to the current route and params
            await invalidateCurrent();
        },
        // BUG: No error handling
        // BUG: If backend returns HttpException object (not thrown), mutation succeeds but UI doesn't update
    });
};

export const useRemoveFromFavorites = () => {
    const invalidateCurrent = useInvalidateQueries();

    return useMutation({
        mutationFn: movieApi.removeFromFavorites,
        onSuccess: async () => {
            await invalidateCurrent();
        },
        // BUG: No error handling
    });
};

