import { Controller, Get, Param } from '@nestjs/common';
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
}
