import { IsInt, IsOptional } from "class-validator";

export class BasicSearchQueryParamsDto {
    @IsOptional()
    @IsInt()
    public take?: number;

    @IsOptional()
    @IsInt()
    public skip?: number;
}
