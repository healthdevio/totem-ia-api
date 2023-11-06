import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionsService } from './recognitions.service';

describe('RecognitionsService', () => {
  let service: RecognitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecognitionsService],
    }).compile();

    service = module.get<RecognitionsService>(RecognitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
