import { Type } from 'class-transformer';
import { Discriminator } from './discriminator.model';
import { SpecificationExtensions } from './extensions.model';
import { ExternalDocumentation } from './external-doc.model';
import { Xml } from './xml.model';

export class Schema extends SpecificationExtensions {
  title: string;
  multipleOf: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string; //RegExp ?
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: boolean[];
  enum?: any[];
  type: DataType;
  @Type(() => Schema)
  allOf: Schema[];
  @Type(() => Schema)
  oneOf: Schema[];
  @Type(() => Schema)
  anyOf: Schema[];
  @Type(() => Schema)
  not: Schema;
  @Type(() => Schema)
  items: Schema;
  @Type(() => Schema)
  properties: Map<string, Schema>;
  additionalProperties: boolean | Schema;
  description: string;
  format: DataTypeFormat;
  default: any;
  nullable: boolean;
  @Type(() => Discriminator)
  discriminator: Discriminator;
  readOnly: boolean;
  writeOnly: boolean;
  @Type(() => Xml)
  xml: Xml;
  @Type(() => ExternalDocumentation)
  externalDocs: ExternalDocumentation;
  example: any;
  deprecated: boolean;
}

export enum DataType {
  NULL = 'null',
  OBJECT = 'object',
  ARRAY = 'array',
  INTEGER = 'integer',
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
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
  PASSWORD = 'password',
}
