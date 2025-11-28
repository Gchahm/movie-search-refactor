import { IsNotEmpty, IsString, IsUrl, Matches } from "class-validator";

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
