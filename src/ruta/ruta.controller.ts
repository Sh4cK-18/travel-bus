import {
  ValidationPipe,
  Controller,
  Post,
  UsePipes,
  Delete,
  Put,
  Body,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { RutaService } from './ruta.service';
import { RutaValidateDto } from './dto/ruta-validate.dto';

@Controller('routes')
export class RutaController {
  constructor(private readonly rutaService: RutaService) {}

  @Post('create-route')
  @UsePipes(new ValidationPipe())
  async createRoute(@Body() data: RutaValidateDto) {
    return this.rutaService.createRoute(data);
  }

  @Get('get-routes')
  async getRoutes() {
    return this.rutaService.getRoutes();
  }

  @Get('get-route/:id')
  async getRoute(@Param('id') id: string) {
    return this.rutaService.getRouteById(id);
  }

  @Put('update-route/:id')
  @UsePipes(new ValidationPipe())
  async updateRoute(@Param('id') id: string, @Body() data: RutaValidateDto) {
    return this.rutaService.updateRoute(id, data);
  }

  @Delete('delete-route/:id')
  async deleteRoute(@Param('id') id: string) {
    return this.rutaService.deleteRoute(id);
  }

  @Get('find-routes')
  @UsePipes(new ValidationPipe())
  async findRoutes(@Query('salida') salida: string, @Query('llegada') llegada: string) {
    return this.rutaService.findRouteByOriginAndDestination(salida, llegada);
  }
}
