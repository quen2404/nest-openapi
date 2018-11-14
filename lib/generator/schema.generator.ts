import TypeScriptAst, { SourceFile } from 'ts-simple-ast';
import { Schema } from 'js-yaml';
import { OpenAPI } from '../model';
import { capitalize } from '../utils';

export class SchemaGenerator {
  constructor(private outputPath: string, private openapi: OpenAPI) {}

  testSchemas() {
    this.openapi.components.schemas.forEach((schema, name) =>
      this.testSchema(name, schema)
    );
  }

  testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(
      `${this.outputPath}/dto/${name}.dto.ts`,
      '',
      {
        overwrite: true
      }
    );
    const className = capitalize(`${name}Dto`);
    tsFile.addClass({
      name: className,
      isExported: true
    });
    tsFile.organizeImports().saveSync();
  }

  resolveSchema(ref: string): Schema {
    const name = ref.split('/').pop();
    return this.openapi.components.schemas.get(name);
  }
}
