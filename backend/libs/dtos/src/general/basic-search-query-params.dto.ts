import { IsInt, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

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
