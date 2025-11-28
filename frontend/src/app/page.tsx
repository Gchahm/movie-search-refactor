'use client';

import {useEffect, useState} from 'react';
import SearchBar from '@/components/searchBar';
import {useSearchMovies} from "@/hooks/useMovies";
import {QueryHandler} from "@/components/QueryHandler";
import {MoviesList} from "@/components/MoviesList";
import {useRouter, useSearchParams} from 'next/navigation';
import {useCurrentPage} from "@/hooks/useCurrentPage";
import {replaceSearchParams} from "@/lib/url";


export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useCurrentPage();

    // Initialize state from URL and keep in sync when URL changes (back/forward navigation)
    useEffect(() => {
        const q = searchParams?.get('q') ?? '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);


    useEffect(() => {
        replaceSearchParams(router, (params) => {
            if (searchQuery) {
                params.set('q', searchQuery);
            } else {
                params.delete('q');
            }
        });

    }, [searchQuery, router]);

    const handleSearch = (query: string) => {
        // Reset page to 1 via state (URL deletion handled by useCurrentPage)
        setCurrentPage(1);
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
                    <SearchBar onSearch={handleSearch} initialQuery={searchQuery}/>
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

