import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignaturesGateway } from './signature/signatures.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SignaturesGateway],
})
export class AppModule {}
