import {useQuery, useMutation, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {movieApi} from '@/lib/api';
import {useCallback} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {SearchMoviesResponse} from "@movie-search/types";

export const useSearchMovies = (q: string, page: number = 1): UseQueryResult<SearchMoviesResponse> => {
    return useQuery({
        queryKey: ['movies', 'search', q, page],
        queryFn: () => movieApi.searchMovies({q, page}),
        enabled: q.length > 0,
    });
};

export const useFavorites = (page: number = 1): UseQueryResult<SearchMoviesResponse> => {
    return useQuery({
        queryKey: ['movies', 'favorites', page],
        queryFn: () => movieApi.getFavorites(page),
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

    const pageParam = searchParams?.get('page');
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    return useCallback(async () => {
        if (pathname === '/favorites') {
            await queryClient.invalidateQueries({queryKey: ['movies', 'favorites', page], exact: true});
            return;
        }
        if (pathname === '/') {
            await queryClient.invalidateQueries({queryKey: ['movies', 'favorites']});
        }

        await queryClient.invalidateQueries({queryKey: ['movies', 'search']});
    }, [pathname, page, queryClient]);
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

