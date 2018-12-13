import { Injectable } from '@nestjs/common';
import { Parser } from './parser';
import { Generator } from './generator';

@Injectable()
export class OpenAPIExplorer {
  explore(sourcePath: string, outputPath: string) {
    const openapi = Parser.readFromFile(sourcePath);
    const generator = new Generator(outputPath, openapi);
    generator.generate();
  }
}
