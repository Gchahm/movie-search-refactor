import {IsInt, IsOptional, Max, Min} from 'class-validator';
import {Type} from "class-transformer";

export class GetFavoritesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Page must be a valid number'})
    @Min(1, {message: 'Page must be higher than zero'})
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Page must be a valid number'})
    @Min(1, {message: 'Page must be higher than zero'})
    @Max(50, {message: 'Page must be lower than 50'})
    pageSize: number = 10;
}
