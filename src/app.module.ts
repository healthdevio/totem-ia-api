import { Module } from '@nestjs/common'
import { CheckinModule } from './domain/checkin/checkin.module'
import { RecognitionsModule } from './domain/recognitions/recognitions.module'

@Module({
  imports: [RecognitionsModule, CheckinModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
