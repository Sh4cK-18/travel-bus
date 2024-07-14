import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

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
}
