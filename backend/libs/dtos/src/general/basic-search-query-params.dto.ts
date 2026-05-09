import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class BasicSearchQueryParamsDto {
    @ApiPropertyOptional({
        description: "Maximum number of records to return.",
        example: 10,
    })
    @IsOptional()
    @IsInt()
    public take?: number;

    @ApiPropertyOptional({
        description: "Number of records to skip (zero-based offset for pagination).",
        example: 0,
    })
    @IsOptional()
    @IsInt()
    public skip?: number;
}
