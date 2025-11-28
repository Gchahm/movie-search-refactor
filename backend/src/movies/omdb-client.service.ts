import axios from "axios";
import { Injectable } from "@nestjs/common";
import { getEnvConfig } from "../config/env.config";

export type OmdbMovie = {
  Title: string;
  Poster: string;
  imdbID: string;
  Year: string;
};

export type OmdbResponse = {
  movies: OmdbMovie[];
  totalResults: number;
};

// Raw shape returned by OMDB API
type OmdbApiResponseRaw = {
  Response?: string;
  Error?: string;
  Search?: OmdbMovie[];
  totalResults?: string;
};

@Injectable()
export class OmdbClientService {
  private readonly baseUrl = `http://www.omdbapi.com/?apikey=${getEnvConfig().omdbApiKey}`;

  async searchMovies(title: string, page: number): Promise<OmdbResponse> {
    const response = await axios.get<OmdbApiResponseRaw>(
      `${this.baseUrl}&s=${encodeURIComponent(title)}&plot=full&page=${page}`,
    );

    const data = response.data;

    if (data.Response?.toLowerCase?.() === "false" || data.Error) {
      return { movies: [], totalResults: 0 };
    }

    return {
      movies: data.Search ?? [],
      totalResults: data.totalResults
        ? parseInt(data.totalResults, 10) || 0
        : 0,
    };
  }
}
