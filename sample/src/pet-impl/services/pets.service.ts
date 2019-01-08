import { Injectable, NotFoundException } from '@nestjs/common';
import { NewPet, IPetsService, Pet } from '../../generated';

@Injectable()
export class PetsImplService implements IPetsService {
  private data: Pet[] = [
    { id: 0, name: 'Nessy', tag: 'dog' },
    { id: 1, name: 'Jodie', tag: 'dog' },
    { id: 2, name: 'Youpi', tag: 'dog' },
    { id: 3, name: 'Hugo', tag: 'cat' },
  ];
  async findPets(tags: string[], limit: number): Promise<Pet[]> {
    return this.data;
  }
  async addPet(body: NewPet): Promise<Pet> {
    const id = this.data.length;
    this.data.push({
      id,
      name: body.name,
      tag: body.tag,
    });
    return await this.findPetById(id);
  }
  async findPetById(id: number): Promise<Pet> {
    console.log('findPetById', id);
    const pet = this.data.filter(pet => pet.id == id).shift();
    if (pet == null) {
      throw new NotFoundException('Unknwon pet with id: ' + id);
    }
    return pet;
  }
  async deletePet(id: number): Promise<any> {
    delete this.data[id];
  }
}
