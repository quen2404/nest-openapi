import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAPIModule } from 'nest-openapi';

@Module({
  imports: [
    OpenAPIModule.forRoot({
      outputPath: __dirname + '/../generated',
      sourcePath: __dirname + '/petstore-expanded.yaml',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
