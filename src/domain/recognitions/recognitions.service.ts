import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import * as dayjs from 'dayjs'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaService } from 'src/infra/database/prisma.service'
import { FaceApiService } from 'src/infra/faceapi/faceapi.service'
import { CreateRecognitionDto } from './dto/create-recognition.dto'
@Injectable()
export class RecognitionsService {
  private service_location_id = '1ce16aff-feba-49d1-9138-b05e73f9e83c'
  private contract_id = '8fc6fa7e-8df9-4536-9d2c-00dbf4041ea5'

  constructor(private readonly faceApi: FaceApiService, private readonly prisma: PrismaService) { }

  create(createRecognitionDto: CreateRecognitionDto) {
    return 'This action adds a new recognition'
  }

  async findAll(fileBase64: string) {
    try {
      const matches = fileBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    const base64Data = matches[2];

    const fileBuffer = Buffer.from(base64Data, 'base64')

    const [result] = await this.faceApi.recognize(fileBuffer)
    if (!result || result.label === 'unknown') {
      return {
        code: 'NF',
        message: 'Cliente não encontrado',
        client: null,
        pendingScheduling: null
      }
    }
    const person = await this.prisma.persons.findFirst({
      where: { id: result.label }
    })

    return {
      client: person,
      personId: result.label,
      code: 'F',
      message: 'Cliente encontrado',
    }
    } catch (error) {
      return {
        code: 'NF',
        message: 'Cliente não encontrado',
        client: null,
        pendingScheduling: null
      }
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

  async update({ cpf, birth_date, telephone, name, }: { cpf: string; birth_date: string; telephone: string; name: string }) {
    let person = await this.prisma.persons.findFirst({
      where: { cpf },
    })

    if (!person) {
      const id = randomUUID()
      person = await this.prisma.persons.create({
        data: {
          cpf, id, birth_date, type: 'F', name, person_telephones: {
            create: {
              id: randomUUID(),
              number: telephone,
              main: true,
              active: true,
              type: 'W'
            }
          }
        },
      })
    }

    //48fa576b-ea28-437b-a12c-594cd1d58b7f //DESCULPE

    let client = await this.prisma.clients.findFirst({
      where: {
        contract_id: this.contract_id,
        person_id: person.id
      }
    })

    if(!client) {
      client = await this.prisma.clients.create({
        data: {
          id: randomUUID(),
          active: true,
          person_id: person.id,
          pre: true,
          contract_id: this.contract_id,
          client_conventions: {
            create: {
              convention_id: '48fa576b-ea28-437b-a12c-594cd1d58b7f',
              active: true,
            }
          }
        }
      })
    }

    const personTelephone = await this.prisma.person_telephones.findFirst({
      where: { person_id: person.id, main: true, active: true }
    })

    if(!personTelephone || personTelephone.number !== telephone) {
      await this.prisma.person_telephones.updateMany({
        where: {
          person_id: person.id,
        },
        data: {
          active: false,
          main: false
        }
      })

      await this.prisma.person_telephones.create({
        data: {
          id: randomUUID(),
          type: 'W',
          active: true, main: true,
          number: telephone,
          person_id: person.id
        }
      })
    }

    return { personId: person.id }
  }

  remove(id: number) {
    return `This action removes a #${id} recognition`
  }

  async getPersonByCpfAndBirthDate({ cpf, birth_date }: { birth_date: string, cpf: string }) {
    const person = await this.prisma.persons.findFirst({
      where: { cpf },
      select: { id: true, cpf: true, birth_date: true, name: true, person_telephones: { where: { main: true, active: true } } }
    })

    console.log({
      dataA: dayjs(person.birth_date).add(3, 'hours').format('YYYY-MM-DD'),
      dataB: dayjs(birth_date).format('YYYY-MM-DD')
    });


    if (person && dayjs(person.birth_date).add(3, 'hours').format('YYYY-MM-DD') !== dayjs(birth_date).format('YYYY-MM-DD')) {
      throw new HttpException({ message: 'Os dados do cliente estão inválidos ou divergentes' }, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    return person
  }

  async upload(base64Img: string, personId: string) {
    const matches = base64Img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    const base64Data = matches[2];

    const fileBuffer = Buffer.from(base64Data, 'base64')
    const folders = path.join(__dirname, '..', '..', '..', 'files')

    if(!fs.existsSync(folders)) {
      fs.mkdirSync(folders)
    }

    if(!fs.existsSync(path.join(folders, personId))) {
      fs.mkdirSync(path.join(folders, personId))
    }

    const imgPath = path.join(folders, personId, 'foto.jpeg')

    console.log('Photo Stored in: ', imgPath);
    

    if(fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath)
    }

    fs.writeFileSync(imgPath, fileBuffer)
    return {success: true}
  }
}
