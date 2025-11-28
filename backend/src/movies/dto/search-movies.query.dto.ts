import {IsInt, IsNotEmpty, IsOptional, IsString, Min} from 'class-validator';
import {Type} from 'class-transformer';

export class SearchMoviesQueryDto {
    @IsString()
    @IsNotEmpty({message: 'Query parameter is required'})
    q!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Page must be a valid number'})
    @Min(1, { message: 'Page must be higher than zero' })
    page: number = 1;
}
