import * as camelcase from 'camelcase';
import { MethodDeclaration, MethodSignature } from 'ts-simple-ast';
import { In, OpenAPI, Parameter } from '../model';
import { SchemaGenerator } from './schema.generator';
import { GeneratorOptions } from './generator-options.interface';

export class ParameterGenerator {
  public constructor(private options: GeneratorOptions, private openapi: OpenAPI, private schemaGen: SchemaGenerator) {}
  public getParameterDecorator(parameter: Parameter): string {
    switch (parameter.in) {
      case In.PATH:
        return 'Param';
      case In.HEADER:
        return 'Headers';
      case In.QUERY:
        return 'Query';
      default:
        return 'Request';
    }
  }

  public testParameter(parameter: Parameter, methodController: MethodDeclaration, methodService: MethodSignature) {
    const decoratorName = this.getParameterDecorator(parameter);
    const decoratorArgs = [`'${parameter.name}'`];
    methodController.getSourceFile().addImportDeclaration({
      namedImports: [decoratorName],
      moduleSpecifier: '@nestjs/common',
    });
    const schemaType = this.schemaGen.getSchemaType(parameter.schema);
    if (schemaType.needImport) {
      methodController.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
      methodService.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
    }
    methodController.addParameter({
      name: camelcase(parameter.name),
      decorators: [
        {
          name: decoratorName,
          arguments: decoratorArgs,
        },
      ],
      type: schemaType.type,
    });
    methodService.addParameter({
      name: parameter.name,
      type: schemaType.type,
    });
  }
}
