import { CodeActionEnum } from "@libs/enums/code/code-action.enum";
import { IsEnum, IsOptional } from "class-validator";

export class GetCodeQueryParamsDto {
    @IsOptional()
    @IsEnum(CodeActionEnum)
    public action?: CodeActionEnum;
}
