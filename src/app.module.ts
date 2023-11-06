import { Module } from '@nestjs/common'
import { RecognitionsModule } from './recognitions/recognitions.module'

@Module({
  imports: [RecognitionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
