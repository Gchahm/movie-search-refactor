import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { FavoritesStorageService } from './favorites-storage.service';
import {OmdbClientService} from "./omdb-client.service";

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [MoviesService, FavoritesStorageService, OmdbClientService],
})
export class MoviesModule {}

