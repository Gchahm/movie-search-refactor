import { Injectable } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import { Movie, SearchMoviesResponse } from "@movie-search/types";
import { GetFavoritesQueryDto } from "./dto/get-favorites.query.dto";
import { SearchMoviesQueryDto } from "./dto/search-movies.query.dto";
import { FavoritesStorageService } from "./favorites-storage.service";
import { ImdbParamDto } from "./dto/imdb-param.dto";
import { OmdbClientService, OmdbMovie } from "./omdb-client.service";
import { getEnvConfig } from "../config/env.config";

@Injectable()
export class MoviesService {
  constructor(
    private readonly favoritesStorage: FavoritesStorageService,
    private readonly omdbClientService: OmdbClientService,
  ) {}

  async getMovieByTitle(
    query: SearchMoviesQueryDto,
  ): Promise<SearchMoviesResponse> {
    const { q: title, page } = query;

    try {
      const { movies, totalResults } =
        await this.omdbClientService.searchMovies(title, page);
      const favorites = await this.favoritesStorage.getFavoritesRecord();

      const formattedResponse = movies.map((movie: OmdbMovie): Movie => {
        const isFavorite = favorites[movie.imdbID.toLowerCase()] ?? false;
        return {
          title: movie.Title,
          imdbID: movie.imdbID,
          year: movie.Year,
          poster: movie.Poster,
          isFavorite,
        };
      });

      return {
        data: {
          movies: formattedResponse,
          count: formattedResponse.length,
          totalResults,
          currentPage: page,
          totalPages: Math.ceil(totalResults / getEnvConfig().omdbPageSize),
        },
      };
    } catch {
      throw new Error(
        "Something went wrong while searching for movies. Please try again later.",
      );
    }
  }

  async addToFavorites(movieToAdd: MovieDto): Promise<void> {
    await this.favoritesStorage.addFavorite(movieToAdd);
  }

  async removeFromFavorites({ imdbID }: ImdbParamDto): Promise<void> {
    await this.favoritesStorage.removeFavorite(imdbID);
  }

  async getFavorites(
    queryDto: GetFavoritesQueryDto,
  ): Promise<SearchMoviesResponse> {
    const { page, pageSize } = queryDto;

    const { favorites, total: totalResults } =
      await this.favoritesStorage.getFavoritesPaginated(page, pageSize);

    return {
      data: {
        movies: favorites,
        count: favorites.length,
        totalResults,
        currentPage: page,
        totalPages: Math.ceil(totalResults / pageSize),
      },
    };
  }
}
