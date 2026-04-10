import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateRedirectionDto {
    @IsDefined()
    @IsNumber()
    public redirectionId: number;

    @IsOptional()
    @IsBoolean()
    public isPremium?: boolean;

    @IsOptional()
    @IsString()
    public targetUrl?: string;

    @IsOptional()
    @IsString()
    public route?: string;
}
