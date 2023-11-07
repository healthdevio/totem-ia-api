import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { UpdateRecognitionDto } from './dto/update-recognition.dto'
import { RecognitionsService } from './recognitions.service'

@Controller('recognitions')
export class RecognitionsController {
  constructor(private readonly recognitionsService: RecognitionsService) {}

  // @Post()
  // create(@Body() createRecognitionDto: CreateRecognitionDto) {
  //   return this.recognitionsService.create(createRecognitionDto)
  // }

  @Post()
  findAll(@Body() { fileString }: { fileString: string }) {
    return this.recognitionsService.findAll(fileString)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recognitionsService.findOne(+id)
  }

  @Get(':id/scheduling')
  getPendingScheduling(@Param('id') id: string) {
    return this.recognitionsService.getPendingScheduling(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecognitionDto: UpdateRecognitionDto,
  ) {
    return this.recognitionsService.update(+id, updateRecognitionDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recognitionsService.remove(+id)
  }

  @Get(':id/image')
  getImage(@Param('id') id: string, @Res() response: Response) {
    const folders = path.join(__dirname, '..', '..', '..', 'files')
    const file = `${folders}/${id}/foto.jpeg`

    const stream = fs.createReadStream(file)
    stream.pipe(response)
  }

}
