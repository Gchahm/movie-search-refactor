import {Movie, SearchMoviesResponse} from "@movie-search/types";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/pagination";
import {useAddToFavorites, useRemoveFromFavorites} from "@/hooks/useMovies";


export type MoviesListProps = {
    response: SearchMoviesResponse;
    defaultFavoriteValue?: boolean;
    currentPage: number;
    onPageClick: (page: number) => void;
}

export const MoviesList = (props: MoviesListProps) => {
    const {response, defaultFavoriteValue = false, currentPage, onPageClick} = props;
    const {data: {movies, totalPages}} = response;

    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();

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
            onPageClick(page);
            // BUG: Using window directly, should check if in browser
            window.scrollTo({top: 0, behavior: "smooth"});
        }
    };

    return (
        <>
            {movies.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">
                        No movies found
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.imdbID}
                                movie={movie}
                                isFavorite={movie.isFavorite ?? defaultFavoriteValue}
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
            )
            }
        </>
    )
}