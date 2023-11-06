import { Injectable } from '@nestjs/common';
import { CreateRecognitionDto } from './dto/create-recognition.dto';
import { UpdateRecognitionDto } from './dto/update-recognition.dto';

@Injectable()
export class RecognitionsService {
  create(createRecognitionDto: CreateRecognitionDto) {
    return 'This action adds a new recognition';
  }

  findAll() {
    return `This action returns all recognitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recognition`;
  }

  update(id: number, updateRecognitionDto: UpdateRecognitionDto) {
    return `This action updates a #${id} recognition`;
  }

  remove(id: number) {
    return `This action removes a #${id} recognition`;
  }
}
