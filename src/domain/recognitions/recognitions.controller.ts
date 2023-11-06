import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecognitionsService } from './recognitions.service';
import { CreateRecognitionDto } from './dto/create-recognition.dto';
import { UpdateRecognitionDto } from './dto/update-recognition.dto';

@Controller('recognitions')
export class RecognitionsController {
  constructor(private readonly recognitionsService: RecognitionsService) {}

  @Post()
  create(@Body() createRecognitionDto: CreateRecognitionDto) {
    return this.recognitionsService.create(createRecognitionDto);
  }

  @Get()
  findAll() {
    return this.recognitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recognitionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecognitionDto: UpdateRecognitionDto) {
    return this.recognitionsService.update(+id, updateRecognitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recognitionsService.remove(+id);
  }
}
