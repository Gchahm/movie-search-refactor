import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { FavoritesStorageService } from './favorites-storage.service';

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [MoviesService, FavoritesStorageService],
})
export class MoviesModule {}

