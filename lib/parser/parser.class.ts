import { OpenAPI } from '../model';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { plainToClass } from 'class-transformer';

export class Parser {
  static readFromFile(filepath: string): OpenAPI {
    var doc = safeLoad(readFileSync(filepath, 'utf8'));
    return plainToClass(OpenAPI, doc as OpenAPI);
  }
}
