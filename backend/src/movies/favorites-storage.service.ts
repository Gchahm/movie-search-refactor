import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MovieDto } from './dto/movie.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FavoritesStorageService {
  private readonly favoritesFilePath = path.join(process.cwd(), 'data', 'favorites.json');

  constructor() {
    // Ensure data directory and file exist on initialization
    this.ensureDataDirectory();
    if (!fs.existsSync(this.favoritesFilePath)) {
      this.saveFavorites([]);
    }
  }

  private get favorites(): MovieDto[] {
    try {
      if (fs.existsSync(this.favoritesFilePath)) {
        const fileContent = fs.readFileSync(this.favoritesFilePath, 'utf-8');
        return JSON.parse(fileContent);
      }
      return [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.favoritesFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private saveFavorites(favorites: MovieDto[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(this.favoritesFilePath, JSON.stringify(favorites, null, 2));
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw new HttpException('Failed to save favorites', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findByImdbId(imdbID: string): MovieDto | undefined {
    return this.favorites.find((movie) => movie.imdbID === imdbID);
  }

  existsByImdbId(imdbID: string): boolean {
    return this.favorites.some((movie) => movie.imdbID === imdbID);
  }

  addFavorite(movie: MovieDto): void {
    const currentFavorites = this.favorites;
    if (currentFavorites.some((fav) => fav.imdbID === movie.imdbID)) {
      throw new HttpException(
        'Movie already in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
    currentFavorites.push(movie);
    this.saveFavorites(currentFavorites);
  }

  removeFavorite(imdbID: string): void {
    const currentFavorites = this.favorites;
    const foundMovie = currentFavorites.find((movie) => movie.imdbID === imdbID);
    if (!foundMovie) {
      throw new HttpException(
        'Movie not found in favorites',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedFavorites = currentFavorites.filter((movie) => movie.imdbID !== imdbID);
    this.saveFavorites(updatedFavorites);
  }

  getFavoritesPaginated(page: number, pageSize: number): {
    favorites: MovieDto[];
    total: number;
  } {
    const currentFavorites = this.favorites;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = currentFavorites.slice(startIndex, endIndex);

    return {
      favorites: paginatedFavorites,
      total: currentFavorites.length,
    };
  }
}
