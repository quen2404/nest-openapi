import TypeScriptAst, {
  ClassDeclaration,
  DecoratorStructure,
  ImportDeclarationStructure,
  SourceFile,
} from 'ts-simple-ast';
import { DataType, OpenAPI, Schema } from '../model';
import { camelToKebab } from '../utils';
import { SchemaType } from './schema-type.class';
import { GeneratorOptions } from './generator-options.interface';

export class SchemaGenerator {
  constructor(private options: GeneratorOptions, private openapi: OpenAPI) {}

  testSchemas() {
    this.openapi.components.schemas.forEach(async (schema, name) => await this.testSchema(name, schema));
  }

  async testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const schemaType = this.getSchemaTypeFromName(name);
    const tsFile: SourceFile = tsAstHelper.createSourceFile(`${this.options.outputPath}/${schemaType.file}`, '', {
      overwrite: true,
    });
    const schemaClass = tsFile.addClass({
      name: schemaType.name,
      isExported: true,
    });
    this.generateProperties(schemaClass, schema.properties);
    if (schema.allOf && schema.allOf.length > 0) {
      schema.allOf.forEach(subSchema => {
        if (subSchema.$ref) {
          const subSchemaType = this.getSchemaType(subSchema);
          schemaClass
            .setExtends(subSchemaType.name)
            .getSourceFile()
            .addImportDeclaration(subSchemaType.getImportDeclaration());
        } else {
          this.generateProperties(schemaClass, subSchema.properties);
        }
      });
    }
    await tsFile.organizeImports().save();
  }

  addValidatorImport(name: string): ImportDeclarationStructure {
    return {
      moduleSpecifier: 'class-validator',
      namedImports: [name],
    };
  }

  generateProperties(schemaClass: ClassDeclaration, properties: Map<string, Schema>) {
    if (properties) {
      properties.forEach((schema, name) => {
        const schemaType = this.getSchemaType(schema);
        const decorators: DecoratorStructure[] = [];
        if (schema.minimum != null) {
          decorators.push({
            name: 'Min',
            arguments: [`${schema.minimum}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('Min'));
        }
        if (schema.maximum != null) {
          decorators.push({
            name: 'Max',
            arguments: [`${schema.minimum}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('Max'));
        }
        if (schema.minLength != null) {
          decorators.push({
            name: 'MinLength',
            arguments: [`${schema.minLength}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('MinLength'));
        }
        if (schema.maxLength != null) {
          decorators.push({
            name: 'MaxLength',
            arguments: [`${schema.maxLength}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('MaxLength'));
        }
        if (schema.pattern != null) {
          decorators.push({
            name: 'Matcher',
            arguments: [`${schema.pattern}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('Matcher'));
        }
        if (schema.minItems != null) {
          decorators.push({
            name: 'ArrayMinSize',
            arguments: [`${schema.minItems}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('ArrayMinSize'));
        }
        if (schema.maxItems != null) {
          decorators.push({
            name: 'ArrayMaxSize',
            arguments: [`${schema.maxItems}`],
          });
          schemaClass.getSourceFile().addImportDeclaration(this.addValidatorImport('ArrayMaxSize'));
        }
        schemaClass.addProperty({
          name: name,
          type: schemaType.type,
          decorators,
        });
      });
    }
  }

  public getSchemaTypeFromName(name: string): SchemaType {
    return new SchemaType(name, `dto/${camelToKebab(name)}.dto`);
  }

  public getNameFromRef(ref: string): string {
    return ref.split('/').pop();
  }

  public getSchemaType(schema: Schema): SchemaType {
    if (schema.$ref) {
      return this.getSchemaTypeFromName(this.getNameFromRef(schema.$ref));
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
