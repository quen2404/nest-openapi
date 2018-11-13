import { Schema } from './schema.model';
import { Example } from './example.model';
import { MediaType } from './media-type.model';
import { Type } from 'class-transformer';

export class Parameter {
  name: string;
  in: In;
  description: string;
  required: boolean;
  deprecated: boolean;
  allowEmptyValue: boolean;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  @Type(() => Schema)
  schema: Schema;
  example: any;
  @Type(() => Example)
  examples: Map<string, Example>;
  @Type(() => MediaType)
  content: Map<string, MediaType>;
}

export enum In {
  QUERY = 'query',
  HEADER = 'header',
  PATH = 'path',
  COOKIE = 'cookie'
}

export enum Style {
  MATRIX = 'matrix',
  LABEL = 'label',
  FORM = 'form',
  SIMPLE = 'simple',
  SPACE_DELIMITED = 'spaceDelimited',
  PIPE_DELIMITED = 'pipeDelimited',
  DEEP_OBJECT = 'deepObject'
}
