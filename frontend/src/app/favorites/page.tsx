"use client";

import { useState } from "react";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/pagination";

import { Button } from "@/components/ui/button";
import { useAddToFavorites, useFavorites, useRemoveFromFavorites } from "@/hooks/useMovies";
import { Movie } from "@movie-search/types";
import Link from "next/link";

const Favorites = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // BUG: No error handling - will crash if API returns 404
  const { data: favorites } = useFavorites(currentPage);
  
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  const handleToggleFavorite = async (movie: Movie) => {
    // BUG: Inefficient check - should use useMemo
    // BUG: This check is redundant - all movies on favorites page are favorites
    // BUG: Logic is inverted - if on favorites page, should always remove
    const isFavorite = favorites?.data.favorites.some(fav => fav.imdbID === movie.imdbID) ?? false;
    // BUG: No error handling
    // BUG: If remove fails, movie stays in list but might be removed from backend
    if (isFavorite) {
      await removeFromFavorites.mutateAsync(movie.imdbID);
      // BUG: After removal, if on last page and it becomes empty, should navigate to previous page
    } else {
      await addToFavorites.mutateAsync(movie);
    }
  };

  const handlePageChange = (page: number) => {
    // BUG: Type mismatch - totalResults might be number instead of string
    if (page >= 1 && page <= (favorites?.data.totalPages || 1)) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  // BUG: Will crash if favorites is undefined
  // BUG: totalResults might be number (from backend bug) or string - toString() might fail
  // BUG: If backend returns number, toString() works but parseInt is redundant
  // BUG: If backend returns string, parseInt works but toString() is unnecessary
  const totalResults = parseInt(favorites?.data.totalResults.toString() || '0');
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl text-white font-bold  bg-clip-text ">
              My Favorites
            </h1>
          </div>
          <p className="text-center text-muted-foreground">
            {totalResults} {totalResults === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding movies to your favorites from the search page
            </p>
            <Link href="/">
              <Button className="bg-gradient-primary">
                Search Movies
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* BUG: No loading state */}
              {favorites?.data.favorites.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* BUG: Complex conditional */}
            {favorites?.data.totalPages && favorites.data.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={favorites.data.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;

