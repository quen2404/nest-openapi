import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAPIModule } from 'nest-openapi';
import { PetModule } from './generated';

@Module({
  imports: [
    OpenAPIModule.forRoot({
      output: {
        path: __dirname + '/generated',
        moduleName: 'Pet',
      },
      sourcePath: __dirname + '/petstore-expanded.yaml',
    }),
    PetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
