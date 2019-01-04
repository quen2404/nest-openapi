import { MediaType, OpenAPI } from '../model';
import { SchemaGenerator } from './schema.generator';
import { SchemaType, TYPE_ANY } from './schema-type.class';
import { GeneratorOptions } from './generator-options.interface';

export class MediaTypeGenerator {
  public constructor(private options: GeneratorOptions, private openapi: OpenAPI, private schemaGen: SchemaGenerator) {}
  public getSchemaType(mediatype: MediaType): SchemaType {
    if (mediatype.schema != null) {
      return this.schemaGen.getSchemaType(mediatype.schema);
    }
    return TYPE_ANY;
  }
}
