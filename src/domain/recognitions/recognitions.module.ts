import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { FaceApiModule } from 'src/infra/faceapi/faceapi.module';
import { RecognitionsController } from './recognitions.controller';
import { RecognitionsService } from './recognitions.service';

@Module({
  controllers: [RecognitionsController],
  providers: [RecognitionsService],
  imports: [FaceApiModule, DatabaseModule]
})
export class RecognitionsModule {}
