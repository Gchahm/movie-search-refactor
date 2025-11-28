import {SearchMoviesResponse} from "@movie-search/types";
import Pagination from "@/components/pagination";
import {MovieCardContainer} from "./MovieCard.container";


export type MoviesListProps = {
    response: SearchMoviesResponse;
    defaultFavoriteValue?: boolean;
    currentPage: number;
    onPageClick: (page: number) => void;
}

export const MoviesList = (props: MoviesListProps) => {
    const {response, defaultFavoriteValue = false, currentPage, onPageClick} = props;
    const {data: {movies, totalPages}} = response;

    const handlePageChange = (page: number) => {
        if (!Number.isFinite(page) || !Number.isInteger(page)) {
            return;
        }

        if (page >= 1 && page <= totalPages) {
            onPageClick(page);
            if (typeof window !== 'undefined') {
                window.scrollTo({top: 0, behavior: "smooth"});
            }
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
                            <MovieCardContainer
                                key={movie.imdbID}
                                movie={movie}
                                isFavorite={movie.isFavorite ?? defaultFavoriteValue}
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