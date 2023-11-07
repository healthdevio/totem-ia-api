import { Module } from "@nestjs/common";
import { FaceApiService } from "./faceapi.service";

@Module({
  providers: [FaceApiService],
  exports: [FaceApiService]
})
export class FaceApiModule {

}