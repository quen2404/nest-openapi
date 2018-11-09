import { Discriminator } from './discriminator.model';
import { Xml } from './xml.model';
import { ExternalDocumentation } from './external-doc.model';

export interface Schema {
  title: string;
  multipleOf: number;
  maximum: number;
  exclusiveMaximum: boolean;
  minimum: number;
  exclusiveMinimum: boolean;
  maxLength: number;
  minLength: number;
  pattern: string; //RegExp ?
  maxItems: number;
  minItems: number;
  uniqueItems: true;
  maxProperties: number;
  minProperties: number;
  required: boolean;
  enum: any[];
  type: DataType;
  allOf: Schema;
  oneOf: Schema;
  anyOf: Schema;
  not: Schema;
  items: Schema;
  properties: {
    [name: string]: Schema;
  };
  additionalProperties: boolean | Schema;
  description: string;
  format: DataTypeFormat;
  default: any;
  nullable: boolean;
  discriminator: Discriminator;
  readOnly: boolean;
  writeOnly: boolean;
  xml: Xml;
  externalDocs: ExternalDocumentation;
  example: any;
  depreacted: boolean;
}

export enum DataType {
  INTEGER = 'integer',
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean'
}

export enum DataTypeFormat {
  INT_32 = 'int32',
  INT_64 = 'int64',
  FLOAT = 'float',
  DOUBLE = 'double',
  BYTE = 'byte',
  BINARY = 'binary',
  DATE = 'date',
  DATE_TIME = 'date-time',
  PASSWORD = 'password'
}
