import {IsInt, IsNotEmpty, IsString, Matches, Min, IsUrl} from 'class-validator';
import {Type} from 'class-transformer';

export class MovieDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @Matches(/^tt\d{7,}$/)
    imdbID: string;

    @Type(() => Number)
    @IsInt()
    @Min(1888)
    year: number;

    @IsUrl({require_protocol: true})
    poster: string;
}

