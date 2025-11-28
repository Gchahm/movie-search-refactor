import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  IsUrl,
} from "class-validator";
import { Type } from "class-transformer";

export class MovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @Matches(/^tt\d{7,}$/)
  imdbID: string;

  @IsString()
  year: string;

  @IsUrl({ require_protocol: true })
  poster: string;
}
