import * as camelcase from 'camelcase';
import { MethodDeclaration, MethodSignature } from 'ts-simple-ast';
import { In, OpenAPI, Parameter } from '../model';
import { SchemaGenerator } from './schema.generator';

export class ParameterGenerator {
  public constructor(private outputPath: string, private openapi: OpenAPI, private schemaGen: SchemaGenerator) {}
  public getParameterDecorator(parameter: Parameter): string {
    switch (parameter.in) {
      case In.PATH:
        return 'Param';
      case In.HEADER:
        return 'Header';
      case In.QUERY:
        return 'Query';
      default:
        return 'Request';
    }
  }

  public testParameter(parameter: Parameter, methodController: MethodDeclaration, methodService: MethodSignature) {
    const camelName = camelcase(parameter.name);
    const decoratorName = this.getParameterDecorator(parameter);
    const decoratorArgs = [];
    if (camelName !== parameter.name) {
      decoratorArgs.push(parameter.name);
    }
    methodController.getSourceFile().addImportDeclaration({
      namedImports: [decoratorName],
      moduleSpecifier: '@nestjs/common',
    });
    const schemaType = this.schemaGen.getSchemaType(parameter.schema);
    if (schemaType.needImport) {
      methodController.getSourceFile().addImportDeclarations(schemaType.getImportDeclarations());
      methodService.getSourceFile().addImportDeclarations(schemaType.getImportDeclarations());
    }
    methodController.addParameter({
      name: parameter.name,
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
