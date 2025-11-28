import MovieCard, {MovieCardProps} from "@/components/MovieCard";
import {useAddToFavorites, useRemoveFromFavorites} from "@/hooks/useMovies";


export const MovieCardContainer = (props: Omit<MovieCardProps, 'onToggleFavorite' | 'isFavoriteLoading'>) => {
    const {movie, isFavorite} = props;

    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();

    const handleToggleFavorite = async () => {
        // Avoid race conditions: block if any favorite mutation is in-flight
        if (addToFavorites.isPending || removeFromFavorites.isPending) return;
        try {
        if (isFavorite) {
                await removeFromFavorites.mutateAsync(movie.imdbID);
        } else {
                await addToFavorites.mutateAsync(movie);
        }
        } catch (e) {
            // Basic error reporting; replace with your toast/notification system if available
            console.error('Failed to toggle favorite', e);
             
            alert('Something went wrong updating favorites. Please try again.');
        }
    };


    return (
        <MovieCard {...props} isFavoriteLoading={addToFavorites.isPending || removeFromFavorites.isPending} onToggleFavorite={handleToggleFavorite}/>
    )
}