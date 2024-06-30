import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketDto } from './dto/ticket-validate.dto';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new ticket.
   * @param {TicketDto} ticketData - The ticket data.
   * @returns {Promise<{ message: string, ticket: Ticket }>} The created ticket and a success message.
   * @throws {HttpException} If there is an error creating the ticket.
   */
  async createTicket({
    rutaId,
    cantidad_adulto,
    cantidad_nino,
    cantidad_tercera_edad,
  }: TicketDto) {
    try {
      const ticket = await this.prisma.boleto.create({
        data: {
          rutaId,
          cantidad_adulto,
          cantidad_nino,
          cantidad_tercera_edad,
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error creating ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Ticket created successfully', ticket };
    } catch (error) {
      return { message: 'Error creating ticket', error };
    }
  }

  /**
   * Retrieves all tickets.
   * @returns {Promise<{ message: string, error: any }>} The result of the operation, including any error that occurred.
   */
  async getTickets() {
    try {
      const tickets = await this.prisma.boleto.findMany();
      if (!tickets) {
        throw new HttpException(
          {
            messageError: 'Error getting tickets',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error getting tickets', error };
    }
  }

  /**
   * Retrieves a ticket by its ID.
   * @param id - The ID of the ticket to retrieve.
   * @returns A Promise that resolves to the retrieved ticket, or an error object if the ticket is not found.
   */
  async getTicketById(id: string) {
    try {
      const ticket = await this.prisma.boleto.findUnique({
        where: {
          boletoId: Number(id),
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error getting ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error getting ticket', error };
    }
  }

  /**
   * Updates a ticket with the specified ID.
   * @param id - The ID of the ticket to update.
   * @param ticketData - The data to update the ticket with.
   * @returns A promise that resolves to the updated ticket if successful, or an error object if an error occurs.
   */
  async updateTicket(id: string, ticketData: TicketDto) {
    try {
      const ticket = await this.prisma.boleto.update({
        where: {
          boletoId: Number(id),
        },
        data: {
          rutaId: ticketData.rutaId,
          cantidad_adulto: ticketData.cantidad_adulto,
          cantidad_nino: ticketData.cantidad_nino,
          cantidad_tercera_edad: ticketData.cantidad_tercera_edad,
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error updating ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error updating ticket', error };
    }
  }

  /**
   * Deletes a ticket with the specified ID.
   * @param id - The ID of the ticket to delete.
   * @returns A promise that resolves to the deleted ticket, or an object with an error message if an error occurs.
   */
  async deleteTicket(id: string) {
    try {
      const ticket = await this.prisma.boleto.delete({
        where: {
          boletoId: Number(id),
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error deleting ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error deleting ticket', error };
    }
  }
}
