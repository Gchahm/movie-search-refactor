import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {MovieDto} from './dto/movie.dto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {FavoritesResponse, Movie, SearchMoviesResponse} from "@movie-search/types";
import {GetFavoritesQueryDto} from "./dto/get-favorites.query.dto";
import {SearchMoviesQueryDto} from "./dto/search-movies.query.dto";

@Injectable()
export class MoviesService {
    private favorites: Movie[] = [];
    private readonly favoritesFilePath = path.join(process.cwd(), 'data', 'favorites.json');

    // BUG: Hardcoded API key fallback - security issue
    private readonly baseUrl = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY || 'demo123'}`;

    constructor() {
        this.loadFavorites();
    }

    private loadFavorites(): void {
        // BUG: No error handling for file operations
        if (fs.existsSync(this.favoritesFilePath)) {
            const fileContent = fs.readFileSync(this.favoritesFilePath, 'utf-8');
            this.favorites = JSON.parse(fileContent);
        } else {
            // BUG: Directory might not exist, will fail
            this.favorites = [];
        }
    }

    private saveFavorites(): void {
        // BUG: No directory creation check, no error handling
        fs.writeFileSync(this.favoritesFilePath, JSON.stringify(this.favorites, null, 2));
    }

    private async searchMovies(title: string, page: number = 1): Promise<any> {
        // BUG: No input validation, no error handling
        const response = await axios.get(
            `${this.baseUrl}&s=${title}&plot=full&page=${page}`, // BUG: Missing encodeURIComponent
        );

        // BUG: OMDb API returns Response: "False" (string) when no results, not a boolean
        // This check will fail silently - Response field is always a string
        if (response.data.Response === false || response.data.Error) {
            return {movies: [], totalResults: '0'};
        }

        return {
            movies: response.data.Search || [],
            totalResults: response.data.totalResults || '0'
        };
    }

    async getMovieByTitle(query: SearchMoviesQueryDto): Promise<SearchMoviesResponse> {
        const {q: title, page} = query;

        // BUG: No try-catch, will crash on API errors
        const response = await this.searchMovies(title, page);

        // BUG: Inefficient - checking favorites on every search
        // BUG: favorites array might be stale if file was modified externally
        const formattedResponse = response.movies.map((movie: any) => {
            // BUG: Case-sensitive comparison - some IDs might have different casing
            const isFavorite = this.favorites.find(fav => fav.imdbID === movie.imdbID) !== undefined;
            return {
                title: movie.Title,
                imdbID: movie.imdbID,
                year: movie.Year, // BUG: Should parse to number, also handles "1999-2000" format incorrectly
                poster: movie.Poster,
                isFavorite,
            };
        });

        return {
            data: {
                movies: formattedResponse,
                count: formattedResponse.length,
                totalResults: response.totalResults,
            },
        };
    }

    async addToFavorites(movieToAdd: MovieDto): Promise<void> {
        // BUG: No validation that movieToAdd has required fields
        // BUG: Using find instead of some for performance
        // BUG: Not reloading favorites from file - if file was modified, this array is stale
        const foundMovie = this.favorites.find((movie) => movie.imdbID === movieToAdd.imdbID);
        if (foundMovie) {
            // BUG: Returning error instead of throwing
            throw new HttpException(
                'Movie already in favorites',
                HttpStatus.BAD_REQUEST,
            );
        }

        // BUG: Not validating movie structure
        // BUG: Not checking if movieToAdd has all required fields (poster might be missing)
        this.favorites.push(movieToAdd);
        this.saveFavorites();
    }

    async removeFromFavorites(movieId: string): Promise<void> {
        // BUG: No validation that movieId is provided
        const foundMovie = this.favorites.find((movie) => movie.imdbID === movieId);
        if (!foundMovie) {
            throw new HttpException(
                'Movie not found in favorites',
                HttpStatus.NOT_FOUND,
            );
        }

        // BUG: Inefficient - using filter creates new array
        this.favorites = this.favorites.filter((movie) => movie.imdbID !== movieId);
        this.saveFavorites();
    }

    async getFavorites(queryDto: GetFavoritesQueryDto): Promise<FavoritesResponse> {
        const {page, pageSize} = queryDto;

        // BUG: Not reloading favorites from file - might be stale
        // BUG: Throwing error when empty instead of returning empty array
        if (this.favorites.length === 0) {
            throw new HttpException('No favorites found', HttpStatus.NOT_FOUND);
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedFavorites = this.favorites.slice(startIndex, endIndex);

        // BUG: Inconsistent response structure
        return {
            data: {
                favorites: paginatedFavorites,
                count: paginatedFavorites.length,
                totalResults: `${this.favorites.length}`,
                currentPage: page,
                totalPages: Math.ceil(this.favorites.length / pageSize),
            },
        };
    }
}

