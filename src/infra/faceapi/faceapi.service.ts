import { Injectable, Logger } from "@nestjs/common";
import * as tf from "@tensorflow/tfjs-node";
import * as faceapi from '@vladmandic/face-api';
import { SsdMobilenetv1Options } from '@vladmandic/face-api';
import * as canvas from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any });


@Injectable()
export class FaceApiService {
  private modelsUrl: string
  private logger: Logger
  private optionsSSDMobileNet: SsdMobilenetv1Options

  constructor() {
    this.modelsUrl = '../config/faceapi/models'
    this.logger = new Logger(FaceApiService.name)
  }

  private async loadModels() {
    this.logger.debug("FaceAPI single-process test");

    // await faceapi.tf("tensorflow");
    // await faceapi.tf.enableProdMode();
    // await faceapi.tf.ENV.set("DEBUG", false);
    // await faceapi.tf.ready();

    // console.log(
    //   `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
    //     faceapi.version.faceapi
    //   } Backend: ${faceapi.tf?.getBackend()}`
    // );

    console.log("Loading FaceAPI models");
    const modelPath = path.join(__dirname, this.modelsUrl);

    console.log('>> ', modelPath);
    

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)
    this.optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.5,
    });
  }

  private async getImage(file: Buffer) {
    const decoded = tf.node.decodeImage(file);
    const casted = decoded.toFloat();
    const result = casted.expandDims(0);
    decoded.dispose();
    casted.dispose();
    return result;
  }

  private async detect(tensor: faceapi.TNetInput) {
    const result = await faceapi
      .detectAllFaces(tensor, this.optionsSSDMobileNet)
      .withFaceLandmarks()
      .withFaceDescriptors();
    return result;
  }


  async recognize(buffer: Buffer) {
    await this.loadModels();
    this.logger.debug(`Models loaded`)


    const tensor = await this.getImage(buffer);
    const result = await this.detect(tensor as any);

    const filepaths = path.join(__dirname, '..', '..', '..', 'files')
    if(!fs.existsSync(filepaths)) {
      fs.mkdirSync(filepaths)
    } 

    const filespath = path.join(__dirname, '..', '..', '..', 'files')

    console.log('File where we read ', filepaths);
    

    const folders = fs.readdirSync(filespath)

    console.log('Readed files and folders ', folders);
    

    const labeledFaceDescriptors = await Promise.all(
      folders.map(async label => {

        const imgUrl = `${path.join(__dirname, '..', '..', '..', 'files')}/${label}/foto.jpeg`
        const img = await this.getImage(fs.readFileSync(imgUrl))

        const faceDescription = await faceapi.detectSingleFace(img as any).withFaceLandmarks().withFaceDescriptor()

        if (!faceDescription) {
          throw new Error(`no faces detected for ${label}`)
        }

        const faceDescriptors = [faceDescription.descriptor]
        return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
      })
    );

    const threshold = 0.5
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold)

    const results = result.map(fd => faceMatcher.findBestMatch(fd.descriptor))

    console.log(results)

    tensor.dispose();

    return results;

  }
}