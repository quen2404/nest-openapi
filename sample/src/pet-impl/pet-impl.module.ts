import { Module } from '@nestjs/common';
import { PetsImplService } from './services/pets.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    PetsImplService,
    {
      provide: 'PetsService',
      useClass: PetsImplService,
    },
  ],
  exports: ['PetsService'],
})
export class PetImplModule {}
