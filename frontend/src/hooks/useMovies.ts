import {useQuery, useMutation, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {movieApi} from '@/lib/api';
import {useCallback} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {SearchMoviesResponse} from "@movie-search/types";

export const useSearchMovies = (query: string, page: number = 1): UseQueryResult<SearchMoviesResponse> => {
    return useQuery({
        queryKey: ['movies', 'search', query, page],
        queryFn: () => movieApi.searchMovies(query, page),
        enabled: query.length > 0,
        retry: 3,
        retryDelay: 1000,
        // BUG: No error handling configuration
    });
};

export const useFavorites = (page: number = 1): UseQueryResult<SearchMoviesResponse> => {
    return useQuery({
        queryKey: ['movies', 'favorites', page],
        queryFn: () => movieApi.getFavorites(page),
        retry: 3,
        retryDelay: 1000,
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
            await invalidateCurrent();
        },
        // BUG: No error handling
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

