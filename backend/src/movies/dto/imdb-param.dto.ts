import { IsNotEmpty, IsString, Matches } from "class-validator";

export class ImdbParamDto {
  @IsString()
  @IsNotEmpty({ message: "imdbID cannot be empty" })
  @Matches(/^tt\d{7,}$/, { message: "imdbID must be a valid IMDb ID" })
  imdbID!: string;
}
