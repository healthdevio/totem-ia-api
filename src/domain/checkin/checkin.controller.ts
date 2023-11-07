import { Body, Controller, Param, Post } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { DoCheckinDTO } from './dto/checkin.dto';

@Controller('checkin')
export class CheckinController {

  constructor(
    private checkinService: CheckinService
  ) {}

  @Post(':schedulingId')
  checkin(
    @Param('schedulingId') schedulingId: string,
    @Body() payload: DoCheckinDTO
  ) {
    return this.checkinService.execute(schedulingId, payload)
  }
}
