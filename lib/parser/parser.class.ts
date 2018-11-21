import { OpenAPI } from '../model';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { plainToClass } from 'class-transformer';

export class Parser {
  static readFromFile(filepath: string): OpenAPI {
    return plainToClass(OpenAPI, safeLoad(readFileSync(filepath, 'utf8')) as OpenAPI);
  }
}
