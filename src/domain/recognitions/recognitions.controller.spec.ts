import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionsController } from './recognitions.controller';
import { RecognitionsService } from './recognitions.service';

describe('RecognitionsController', () => {
  let controller: RecognitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecognitionsController],
      providers: [RecognitionsService],
    }).compile();

    controller = module.get<RecognitionsController>(RecognitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
