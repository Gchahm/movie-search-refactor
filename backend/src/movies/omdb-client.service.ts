import axios from "axios";
import {Injectable} from "@nestjs/common";
import {getEnvConfig} from "../config/env.config";

export type OmdbMovie = {
    Title: string;
    Poster: string;
    imdbID: string;
    Year: string;
};

export type OmdbResponse = {
    movies: OmdbMovie[];
    totalResults: string;
};

@Injectable()
export class OmdbClientService {

    private readonly baseUrl = `http://www.omdbapi.com/?apikey=${getEnvConfig().OMDB_API_KEY}`;

    async searchMovies(title: string, page: number): Promise<OmdbResponse> {
        const response = await axios.get(
            `${this.baseUrl}&s=${encodeURIComponent(title)}&plot=full&page=${page}`,
        );

        if (response.data.Response.toLowerCase() === 'false' || response.data.Error) {
            return {movies: [], totalResults: '0'};
        }

        return {
            movies: response.data.Search || [],
            totalResults: response.data.totalResults || '0'
        };
    }
}