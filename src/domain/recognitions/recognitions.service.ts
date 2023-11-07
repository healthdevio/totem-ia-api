import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/infra/database/prisma.service'
import { FaceApiService } from 'src/infra/faceapi/faceapi.service'
import { CreateRecognitionDto } from './dto/create-recognition.dto'
import { UpdateRecognitionDto } from './dto/update-recognition.dto'

@Injectable()
export class RecognitionsService {
  private service_location_id = '1ce16aff-feba-49d1-9138-b05e73f9e83c'
  private contract_id = '8fc6fa7e-8df9-4536-9d2c-00dbf4041ea5'

  constructor(private readonly faceApi: FaceApiService, private readonly prisma: PrismaService) {}

  create(createRecognitionDto: CreateRecognitionDto) {
    return 'This action adds a new recognition'
  }

  async findAll(fileBase64: string) {
    const matches = fileBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    const base64Data = matches[2];

    const fileBuffer = Buffer.from(base64Data, 'base64')

    const [result] = await this.faceApi.recognize(fileBuffer)
    if(!result || result.label === 'unknown') {
      return {
        code: 'NF',
        message: 'Cliente não encontrado',
        client: null,
        pendingScheduling: null
      }
    }
    const person = await this.prisma.persons.findFirst({
      where: {id: result.label}
    })

    return {
      client: person,
      personId: result.label,
      code: 'F',
      message: 'Cliente encontrado',
    }
  }

  async getPendingScheduling(personId: string) {
    const toDate = new Date()

    const time = new Date(`1970-01-01 ${toDate.getHours()}:${toDate.getMinutes()}:00.000Z`)
    const date = new Date(`${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()} 00:00:00.000Z`)

    console.log(date)

    const client = await this.prisma.clients.findFirst({
      include: {
        persons: true,
        schedulings: {
          include: {
            specialities: true,
            schedules: {
              include: {
                professionals: {
                  include: {
                    persons: true
                  }
                }
              }
            }
          },
          where: {
            time: {
              gte: time
            },
            schedules: {
              date: date
            },
            active: true
          },
          orderBy: {
            time: 'asc'
          }
        }
      },
      where: {
        person_id: personId,
        contract_id: this.contract_id
      }
    })

    return {
      pendingScheduling: client.schedulings[0],
      person: client.persons
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} recognition`
  }

  update(id: number, updateRecognitionDto: UpdateRecognitionDto) {
    return `This action updates a #${id} recognition`
  }

  remove(id: number) {
    return `This action removes a #${id} recognition`
  }
}
