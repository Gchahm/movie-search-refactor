import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import { promises as fs } from "fs";
import * as path from "path";
import { Movie, MovieSchema } from "@movie-search/types";

@Injectable()
export class FavoritesStorageService {
  private readonly favoritesFilePath = path.join(
    process.cwd(),
    "data",
    "favorites.json",
  );

  async onModuleInit() {
    // Ensure data directory and file exist on initialization
    await this.ensureDataDirectory();
    try {
      await fs.access(this.favoritesFilePath);
    } catch {
      await this.saveFavorites([]);
    }
  }

  private async getFavorites(): Promise<Movie[]> {
    try {
      const fileContent = await fs.readFile(this.favoritesFilePath, "utf-8");
      const parsedMovies: unknown = JSON.parse(fileContent);
      if (!Array.isArray(parsedMovies)) {
        return [];
      } else {
        return parsedMovies
          .map((movie) => MovieSchema.safeParse(movie))
          .filter((z) => z.success)
          .map((z) => z.data);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      console.error("Error loading favorites:", error);
      return [];
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.favoritesFilePath);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }
  }

  private async saveFavorites(favorites: MovieDto[]): Promise<void> {
    try {
      await this.ensureDataDirectory();
      await fs.writeFile(
        this.favoritesFilePath,
        JSON.stringify(favorites, null, 2),
      );
    } catch (error) {
      console.error("Error saving favorites:", error);
      throw new HttpException(
        "Failed to save favorites",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFavoritesRecord(): Promise<Record<string, boolean>> {
    const favorites = await this.getFavorites();
    return favorites.reduce(
      (acc, { imdbID }) => ({ ...acc, [imdbID.toLowerCase()]: true }),
      {},
    );
  }

  async addFavorite(movie: MovieDto): Promise<void> {
    const currentFavorites = await this.getFavorites();
    if (currentFavorites.some((fav) => fav.imdbID === movie.imdbID)) {
      throw new HttpException(
        "Movie already in favorites",
        HttpStatus.BAD_REQUEST,
      );
    }
    currentFavorites.push(movie);
    await this.saveFavorites(currentFavorites);
  }

  async removeFavorite(imdbID: string): Promise<void> {
    const currentFavorites = await this.getFavorites();
    const foundMovie = currentFavorites.find(
      (movie) => movie.imdbID === imdbID,
    );
    if (!foundMovie) {
      throw new HttpException(
        "Movie not found in favorites",
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedFavorites = currentFavorites.filter(
      (movie) => movie.imdbID !== imdbID,
    );
    await this.saveFavorites(updatedFavorites);
  }

  async getFavoritesPaginated(
    page: number,
    pageSize: number,
  ): Promise<{
    favorites: Movie[];
    total: number;
  }> {
    const currentFavorites = await this.getFavorites();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = currentFavorites.slice(startIndex, endIndex);

    return {
      favorites: paginatedFavorites,
      total: currentFavorites.length,
    };
  }
}
