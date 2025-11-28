'use client';

import {useEffect, useState} from 'react';
import SearchBar from '@/components/searchBar';
import {useSearchMovies} from "@/hooks/useMovies";
import {QueryHandler} from "@/components/QueryHandler";
import {MoviesList} from "@/components/MoviesList";
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useCurrentPage} from "@/hooks/useCurrentPage";


export default function SearchPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useCurrentPage();

    // Initialize state from URL and keep in sync when URL changes (back/forward navigation)
    useEffect(() => {
        const q = searchParams?.get('q') ?? '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [searchParams]);

    // Note: don't auto-reset page on `searchQuery` changes here because
    // URL/back-forward updates of `q` should preserve `page`. We'll reset
    // page explicitly when user submits a new search.

    // Push state to URL whenever query changes (page is handled by useCurrentPage)
    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString());

        // Manage query param `q`
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }

        const next = params.toString();
        const current = searchParams?.toString() ?? '';
        if (next !== current) {
            const url = next ? `${pathname}?${next}` : pathname;
            // replace to avoid polluting history for typing/pagination
            router.replace(url);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, pathname, router]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
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

