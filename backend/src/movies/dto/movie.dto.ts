import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
} from "class-validator";

export class MovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @Matches(/^tt\d{7,}$/)
  imdbID: string;

  @IsString()
  year: string;

  @IsString()
  @ValidateIf((o) => o === "N/A")
  @IsUrl({ require_protocol: true })
  poster: string;
}
