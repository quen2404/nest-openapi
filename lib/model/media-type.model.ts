import { Schema } from './schema.model';
import { Example } from './example.model';
import { Encoding } from './encoding.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';

export class MediaType extends SpecificationExtensions {
  schema: Schema;
  example: any;
  @Type(() => Example)
  examples: Map<string, Example>;
  @Type(() => Encoding)
  encoding: Map<string, Encoding>;
}
