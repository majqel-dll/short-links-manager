import { IsBoolean, IsDefined, IsString } from "class-validator";

export class CreateRedirectionDto {

    @IsDefined()
    @IsBoolean()
    public isPremium: boolean;

    @IsDefined()
    @IsString()
    public targetUrl: string;

    @IsDefined()
    @IsString()
    public route: string;

}