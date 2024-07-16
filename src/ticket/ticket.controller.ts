import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketDto } from './dto/ticket-validate.dto';

@Controller('ticket')
export class TicketController {
    constructor(private ticketService: TicketService) {}

    @Post('create-ticket')
    @UsePipes(new ValidationPipe())
    async createTicket(@Body() data: TicketDto) {
        return this.ticketService.createTicket(data);
    }

    @Get('get-tickets')
    async getTickets() {
        return this.ticketService.getTickets();
    }

    @Get('get-ticket/:id')
    async getTicket(@Param('id') id: string) {
        return this.ticketService.getTicketById(id);
    }

    @Put('update-ticket/:id')
    @UsePipes(new ValidationPipe())
    async updateTicket(@Param('id') id: string, @Body() data: TicketDto) {
        return this.ticketService.updateTicket(id, data);
    }

    @Delete('delete-ticket/:id')
    async deleteTicket(@Param('id') id: string) {
        return this.ticketService.deleteTicket(id);
    }

    @Get('get-tickets-by-user/:userId')
    async getTicketsByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.ticketService.getTicketsByUserId(userId);
    }
}
