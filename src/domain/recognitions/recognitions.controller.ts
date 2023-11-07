import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { RecognitionsService } from './recognitions.service'

@Controller('recognitions')
export class RecognitionsController {
  constructor(private readonly recognitionsService: RecognitionsService) { }

  // @Post()
  // create(@Body() createRecognitionDto: CreateRecognitionDto) {
  //   return this.recognitionsService.create(createRecognitionDto)
  // }

  @Post()
  findAll(@Body() { fileString }: { fileString: string }) {
    return this.recognitionsService.findAll(fileString)
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.recognitionsService.findOne(+id)
  // }

  @Get(':id/scheduling')
  getPendingScheduling(@Param('id') id: string) {
    return this.recognitionsService.getPendingScheduling(id)
  }

  @Put('person')
  update(
    @Body() updateRecognitionDto: {cpf: string; birth_date: string; telephone: string; name: string},
  ) {
    return this.recognitionsService.update(updateRecognitionDto)
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

  @Get('/person')
  getPersonByCpfAndBirthDate(@Query() data: { birth_date: string, cpf: string }) { 
    return this.recognitionsService.getPersonByCpfAndBirthDate(data)
  }

  @Post('upload')
  upload(@Body() {base64Img, personId}: {base64Img: string, personId: string}) {
    return this.recognitionsService.upload(base64Img, personId)
  }
}
