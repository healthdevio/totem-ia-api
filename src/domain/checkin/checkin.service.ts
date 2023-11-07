import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { v4 as uuid } from 'uuid';
import { DoCheckinDTO } from './dto/checkin.dto';

@Injectable()
export class CheckinService {
  private service_location_id = '1ce16aff-feba-49d1-9138-b05e73f9e83c'
  private contract_id = '8fc6fa7e-8df9-4536-9d2c-00dbf4041ea5'

  constructor(private readonly prisma: PrismaService) {}

  async execute(schedulingId: string, payload: DoCheckinDTO) {
    const scheduling = await this.prisma.schedulings.findUnique({
      include: {
        scheduling_procedures: true,
        client_conventions: true,
        schedules: true,
        clients: true
      },
      where: { id: schedulingId}
    })


    if (scheduling.checkin_id) {
      throw new HttpException(
        { message: ['Checkin já realizado para este agendamento!'] },
        HttpStatus.BAD_REQUEST,
      )
    }

    const schedulingSource =
      await this.prisma.scheduling_sources.findFirst({
        where: {
          code: 'SS'
        }
      })


    const updateSchedulingParams = {
      schedulingId: scheduling.id,
      clientId: scheduling.clients.id,
      contractId: this.contract_id,
    }

    await this.prisma.schedulings.update({
      data: {
        client_id: scheduling.clients.id,
        status_id: scheduling.status_id,
        client_convention_id: payload.clientConventionId,
        source_id: schedulingSource.id
      },
      where: { id: schedulingId}
    })

    const source = await this.prisma.source.findFirst({
      where: {
        type: 'R'
      }
    })

    const checkin = await this.prisma.checkin.create({
      data: {
        id: uuid(),
        source_id: source.id,
      },
    })

    const status = await this.prisma.scheduling_status.findFirst({
      where: { tag: 'AG'}
    })

    await this.prisma.schedulings.update({
      where: {
        id: schedulingId,
      },
      data: {
        checkin_id: checkin.id,
        status_id: status.id
      },
    })

    return {
      ...scheduling,
      checkin_id: checkin.id,
      status_id: status.id,
    }
  }
}
