import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfilePictureDto } from './dto/user-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('get-users')
    async getAllUsers() {
        return await this.userService.getUsers();
    }

    @Get('get-user/:id')
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }

    @Post('update-user/:id')
    async updateUser(@Param('id') id: string, @Body() updateData: {nombre: string, apellido: string, password: string, roles?: string[]}) {
        return await this.userService.updateUser(id, updateData);

    }

    @Post('update-profile-picture/:id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfilePicture(
        @Param('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.userService.updateProfilePicture(userId, file);
    }

    @Delete('delete-user/:id')
    async deleteUser(@Param('id') id: string) {
        return await this.userService.deleteUser(id);
    }
        
}
