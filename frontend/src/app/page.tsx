'use client';

import {useEffect, useState} from 'react';
import SearchBar from '@/components/searchBar';
import {useSearchMovies} from "@/hooks/useMovies";
import {QueryHandler} from "@/components/QueryHandler";
import {MoviesList} from "@/components/MoviesList";


export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const result = useSearchMovies(searchQuery, currentPage);

    return (
        <div className="min-h-screen bg-gradient-hero">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
                            Movie Finder
                        </h1>
                    </div>
                    <SearchBar onSearch={handleSearch}/>
                </div>
                <QueryHandler queryResult={result}
                              loadingText="Searching for movies..."
                              pendingTitle="Start Your Search"
                              pendingDescription="Search for your favorite movies and add them to your favorites"
                              errorTitle="Error fetching movies">
                    {
                        (response) => (
                            <MoviesList currentPage={currentPage} onPageClick={setCurrentPage} response={response}/>
                        )
                    }
                </QueryHandler>

            </div>
        </div>
    );
}

