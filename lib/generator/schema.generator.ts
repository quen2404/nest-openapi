import TypeScriptAst, { SourceFile } from 'ts-simple-ast';
import { OpenAPI, Schema, DataType } from '../model';
import { capitalize, camelToKebab } from '../utils';

export class SchemaGenerator {
  constructor(private outputPath: string, private openapi: OpenAPI) {}

  testSchemas() {
    this.openapi.components.schemas.forEach((schema, name) => this.testSchema(name, schema));
  }

  testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const fileName = `dto/${camelToKebab(name)}.dto.ts`;
    const tsFile: SourceFile = tsAstHelper.createSourceFile(`${this.outputPath}/${fileName}`, '', {
      overwrite: true,
    });
    const className = capitalize(`${name}Dto`);
    const schemaClass = tsFile.addClass({
      name: className,
      isExported: true,
    });
    if (schema.properties) {
      schema.properties.forEach((propSchema, propName) => {
        schemaClass.addProperty({
          name: propName,
          type: this.getTypeFromSchema(propSchema),
        });
      });
    }
    tsFile.organizeImports().saveSync();
  }

  resolveSchema(ref: string): Schema {
    const name = ref.split('/').pop();
    return this.openapi.components.schemas.get(name);
  }

  public getTypeFromSchema(schema: Schema): string {
    if (schema.type) {
      if (schema.type == DataType.INTEGER) {
        return DataType.NUMBER;
      }
      if (schema.type == DataType.ARRAY) {
        return this.getTypeFromSchema(schema.items) + '[]';
      }
      if (schema.type == DataType.OBJECT || schema.type == DataType.NULL) {
        return 'any';
      }
      return schema.type;
    }
    return 'any'; //TODO
  }
}
