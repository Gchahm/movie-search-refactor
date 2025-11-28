import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MovieDto } from "./dto/movie.dto";
import { SearchMoviesQueryDto } from "./dto/search-movies.query.dto";
import { ImdbParamDto } from "./dto/imdb-param.dto";
import { GetFavoritesQueryDto } from "./dto/get-favorites.query.dto";
import { SearchMoviesResponse } from "@movie-search/types";

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get("search")
  async searchMovies(
    @Query() queryDto: SearchMoviesQueryDto,
  ): Promise<SearchMoviesResponse> {
    return await this.moviesService.getMovieByTitle(queryDto);
  }

  @Post("favorites")
  addToFavorites(@Body() movieToAdd: MovieDto): Promise<void> {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  removeFromFavorites(@Param() params: ImdbParamDto): Promise<void> {
    return this.moviesService.removeFromFavorites(params);
  }

  @Get("favorites/list")
  getFavorites(
    @Query() queryDto: GetFavoritesQueryDto,
  ): Promise<SearchMoviesResponse> {
    return this.moviesService.getFavorites(queryDto);
  }
}
