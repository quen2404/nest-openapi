import { OpenAPI } from '../model';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { plainToClass } from 'class-transformer';

export class Parser {
  static readFromFile(filepath: string): OpenAPI {
    let content = readFileSync(filepath, 'utf8');
    let plain: OpenAPI;
    if (filepath.endsWith('.json')) {
      plain = JSON.parse(content);
    } else if (filepath.endsWith('.yaml') || filepath.endsWith('.yml')) {
      plain = safeLoad(content);
    } else {
      throw new Error(`Unknwon file extension for file ${filepath}`);
    }
    return plainToClass(OpenAPI, plain);
  }
}
