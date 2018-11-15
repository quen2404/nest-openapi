import TypeScriptAst, { SourceFile, ImportDeclarationStructure } from 'ts-simple-ast';
import { OpenAPI, Schema, DataType } from '../model';
import { capitalize, camelToKebab } from '../utils';
import { textChangeRangeIsUnchanged } from 'typescript';

export class SchemaGenerator {
  constructor(private outputPath: string, private openapi: OpenAPI) {}

  testSchemas() {
    this.openapi.components.schemas.forEach((schema, name) => this.testSchema(name, schema));
  }

  testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const schemaType = this.getSchemaTypeFromName(name);
    const tsFile: SourceFile = tsAstHelper.createSourceFile(`${this.outputPath}/${schemaType.file}`, '', {
      overwrite: true,
    });
    const schemaClass = tsFile.addClass({
      name: schemaType.name,
      isExported: true,
    });
    if (schema.properties) {
      schema.properties.forEach((propSchema, propName) => {
        const schemaType = this.getSchemaType(propSchema);
        schemaClass.addProperty({
          name: propName,
          type: schemaType.type,
        });
      });
    }
    tsFile.organizeImports().saveSync();
  }

  public getSchemaTypeFromName(name: string): SchemaType {
    return new SchemaType(name, `dto/${camelToKebab(name)}.dto`);
  }

  public getSchemaType(schema: Schema): SchemaType {
    if (schema.$ref) {
      return this.getSchemaTypeFromName(schema.$ref.split('/').pop());
    }
    if (schema.type) {
      if (schema.type == DataType.INTEGER) {
        return new SchemaType(DataType.NUMBER);
      }
      if (schema.type == DataType.ARRAY) {
        const typeName = this.getSchemaType(schema.items);
        typeName.isArray = true;
        return typeName;
      }
      if (schema.type == DataType.OBJECT || schema.type == DataType.NULL) {
        return new SchemaType('any');
      }
      return new SchemaType(schema.type);
    }
    return new SchemaType('any'); //TODO
  }
}

export class SchemaType {
  constructor(public name: string, public module?: string, public isArray?: boolean) {
    if (isArray == null) {
      this.isArray = false;
    }
  }

  get type(): string {
    return this.name + (this.isArray ? '[]' : '');
  }

  get file(): string {
    return `${this.module}.ts`;
  }

  get needImport(): boolean {
    return this.module != null;
  }

  getImportDeclaration(): ImportDeclarationStructure {
    if (!this.needImport) {
      return null;
    }
    return {
      moduleSpecifier: `../${this.module}`,
      namedImports: [this.name],
    };
  }
}
