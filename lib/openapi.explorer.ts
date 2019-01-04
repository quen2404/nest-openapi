import { Injectable } from '@nestjs/common';
import { Parser } from './parser';
import { Generator } from './generator';
import { OpenAPIModuleOptions } from './interfaces';

@Injectable()
export class OpenAPIExplorer {
  explore(moduleOptions: OpenAPIModuleOptions) {
    const openapi = Parser.readFromFile(moduleOptions.sourcePath);
    const generator = new Generator(
      {
        moduleName: moduleOptions.output.moduleName,
        outputPath: moduleOptions.output.path,
      },
      openapi,
    );
    generator.generate();
  }
}
