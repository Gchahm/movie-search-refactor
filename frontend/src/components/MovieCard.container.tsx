import MovieCard, {MovieCardProps} from "@/components/MovieCard";
import {useAddToFavorites, useRemoveFromFavorites} from "@/hooks/useMovies";


export const MovieCardContainer = (props: Omit<MovieCardProps, 'onToggleFavorite'>) => {
    const {movie, isFavorite} = props;

    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();

    const handleToggleFavorite = async () => {
        // BUG: No error handling
        // BUG: No loading state
        // BUG: If mutation fails, UI state (isFavorite) is already updated optimistically
        // BUG: No way to rollback if mutation fails
        // BUG: Can be called multiple times rapidly, causing race conditions
        if (isFavorite) {
            await removeFromFavorites.mutateAsync(movie.imdbID);
        } else {
            await addToFavorites.mutateAsync(movie);
        }
        // BUG: After mutation, searchResults still has old isFavorite value
        // Query invalidation happens but component doesn't re-render with new data immediately
    };


    return (
        <MovieCard {...props} onToggleFavorite={handleToggleFavorite}/>
    )
}