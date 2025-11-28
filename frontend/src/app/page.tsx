'use client';

import {useState} from 'react'; // BUG: Unnecessary useEffect import
import SearchBar from '@/components/searchBar';
import {MoviesSearch} from "@/components/MoviesSearch";


export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

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
                <MoviesSearch
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}

