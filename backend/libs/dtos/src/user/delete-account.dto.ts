import { IsDefined, IsString } from "class-validator";

export class DeleteAccountDto {

    @IsDefined()
    @IsString()
    public code: string;

}
