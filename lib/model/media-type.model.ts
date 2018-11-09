import { Schema } from './schema.model';
import { Example } from './example.model';
import { Encoding } from './encoding.model';

export interface MediaType {
  schema: Schema;
  example: any;
  examples: {
    [name: string]: Example;
  };
  encoding: {
    [name: string]: Encoding;
  };
}
