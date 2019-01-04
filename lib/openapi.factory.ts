import { Injectable } from '@nestjs/common';
import { OpenAPIExplorer } from './openapi.explorer';
import { OpenAPIModuleOptions } from './interfaces';

@Injectable()
export class OpenAPIFactory {
  constructor(private readonly openapiExplorer: OpenAPIExplorer) {}

  async generate(options: OpenAPIModuleOptions) {
    if (!options.sourcePath || !options.output || !options.output.path) {
      return;
    }
    this.openapiExplorer.explore(options);
  }
}
