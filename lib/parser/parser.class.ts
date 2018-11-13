import { OpenAPI } from '../model';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { plainToClass } from 'class-transformer';

export class Parser {
  static readFromFile(filepath: string): OpenAPI {
    console.log('filepath:', filepath);
    var doc = safeLoad(readFileSync(filepath, 'utf8'));
    // doc.paths = null;
    // doc.components = null;
    console.log('doc:', doc);
    return plainToClass(OpenAPI, doc as OpenAPI);
  }
}
