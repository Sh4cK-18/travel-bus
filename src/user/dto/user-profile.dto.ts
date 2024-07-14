import { IsNotEmpty, IsString } from "class-validator";

export class UpdateProfilePictureDto {
    @IsString()
    @IsNotEmpty()
    profilePicture: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}