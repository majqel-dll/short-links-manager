import { CodeActionEnum } from "@libs/enums/code/code-action.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export class GetCodeQueryParamsDto {
    @ApiPropertyOptional({
        description: "Filter codes by action type.",
        enum: CodeActionEnum,
        enumName: "CodeActionEnum",
        example: CodeActionEnum.VERIFY_EMAIL,
    })
    @IsOptional()
    @IsEnum(CodeActionEnum)
    public action?: CodeActionEnum;
}
