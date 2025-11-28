"use client";

import {useFavorites} from "@/hooks/useMovies";
import {QueryHandler} from "@/components/QueryHandler";
import {MoviesList} from "@/components/MoviesList";
import {useCurrentPage} from "@/hooks/useCurrentPage";

const Favorites = () => {
    const [currentPage, setCurrentPage] = useCurrentPage();
    const result = useFavorites(currentPage);

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
                        {result.data?.data.totalResults} {result.data?.data.totalResults === 1 ? "movie" : "movies"} saved
                    </p>
                </div>

                <QueryHandler queryResult={result}
                              loadingText="Searching for movies..."
                              pendingTitle="Start Your Search"
                              pendingDescription="Search for your favorite movies and add them to your favorites"
                              errorTitle="Error fetching movies">
                    {
                        (response) => (
                            <MoviesList currentPage={currentPage} defaultFavoriteValue={true}
                                        onPageClick={setCurrentPage} response={response}/>
                        )
                    }
                </QueryHandler>
            </div>
        </div>
    );
};

export default Favorites;

