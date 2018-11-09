import { Schema } from './schema.model';
import { Example } from './example.model';
import { MediaType } from './media-type.model';

export interface Parameter {
  name: string;
  in: string;
  description: string;
  required: boolean;
  deprecated: boolean;
  allowEmptyValue: boolean;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  schema: Schema;
  example: any;
  examples: {
    [name: string]: Example;
  };
  content: {
    [name: string]: MediaType;
  };
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
