import {useAddToFavorites, useRemoveFromFavorites, useSearchMovies} from '@/hooks/useMovies';
import {Movie} from '@movie-search/types';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';
import {useEffect, useState} from "react";

export type MoviesSearchProps = {
    searchQuery: string;
}

export const MoviesSearch = (props: MoviesSearchProps) => {
    const {searchQuery} = props;

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const {
        data: searchResults,
        isLoading,
        isPending,
        isError,
    } = useSearchMovies(searchQuery, currentPage);
    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();

    // BUG: Complex calculation, should be memoized
    // BUG: OMDb returns 10 results per page, but this hardcodes it
    // BUG: If API changes page size, pagination breaks
    // BUG: Recalculates on every render even if searchResults hasn't changed
    const totalPages = searchResults?.data.totalResults
        ? Math.ceil(parseInt(searchResults.data.totalResults) / 10)
        : 0;

    const handleToggleFavorite = async (movie: Movie) => {
        // BUG: No error handling
        // BUG: No loading state
        // BUG: If mutation fails, UI state (isFavorite) is already updated optimistically
        // BUG: No way to rollback if mutation fails
        // BUG: Can be called multiple times rapidly, causing race conditions
        if (movie.isFavorite) {
            await removeFromFavorites.mutateAsync(movie.imdbID);
        } else {
            await addToFavorites.mutateAsync(movie);
        }
        // BUG: After mutation, searchResults still has old isFavorite value
        // Query invalidation happens but component doesn't re-render with new data immediately
    };

    const handlePageChange = (page: number) => {
        // BUG: No validation
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // BUG: Using window directly, should check if in browser
            window.scrollTo({top: 0, behavior: "smooth"});
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div
                    className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent"/>
                <p className="mt-4 text-muted-foreground">Searching for movies...</p>
            </div>
        )
    }

    if (isPending) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
                <p className="text-muted-foreground">
                    Search for your favorite movies and add them to your favorites
                </p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Error fetching movies</p>
            </div>
        )
    }


    if (searchResults.data.movies.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                    No movies found for &quot;{searchQuery}&quot;
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* BUG: No error boundary */}
                {searchResults.data.movies.map((movie) => (
                    <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        isFavorite={movie.isFavorite ?? false}
                        onToggleFavorite={handleToggleFavorite}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    );
}