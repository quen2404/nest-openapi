import TypeScriptAst, {
  SourceFile,
  ClassDeclaration,
  MethodDeclaration,
  SwitchStatement
} from 'ts-simple-ast';
import * as camelcase from 'camelcase';
import {
  OpenAPI,
  Schema,
  Operation,
  Parameter,
  In,
  Responses,
  RequestBody,
  DataType
} from '../model';
import { capitalize } from '../utils';

export class Generator {
  constructor(private outputPath: string, private openApi: OpenAPI) {
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(outputPath, '', {
      overwrite: true
    });
  }

  public formatPath(path: string): string {
    const re = /[\/\{\}]/gi;
    return path.replace(re, '');
  }

  public testPaths() {
    this.openApi.paths.forEach((pathItem, path) => {
      console.log('path', path);
      // const pathItem = this.openApi.paths[path];
      const name = this.formatPath(path);
      const tsAstHelper = new TypeScriptAst();
      const tsFile: SourceFile = tsAstHelper.createSourceFile(
        `${this.outputPath}/controllers/${name}.controller.ts`,
        '',
        {
          overwrite: true
        }
      );
      tsFile.addImportDeclaration({
        namedImports: ['Controller'],
        moduleSpecifier: '@nestjs/common'
      });
      const pathClass: ClassDeclaration = tsFile.addClass({
        name: `${capitalize(name)}Controller`,
        isExported: true,
        decorators: [
          {
            name: 'Controller',
            arguments: [`"${path}"`]
          }
        ]
      });
      this.testOperation('get', pathItem.get, pathClass);
      this.testOperation('put', pathItem.put, pathClass);
      this.testOperation('post', pathItem.post, pathClass);
      this.testOperation('delete', pathItem.delete, pathClass);
      this.testOperation('options', pathItem.options, pathClass);
      this.testOperation('head', pathItem.head, pathClass);
      this.testOperation('patch', pathItem.patch, pathClass);
      this.testOperation('trace', pathItem.trace, pathClass);
      tsFile.saveSync();
    });
  }

  public testOperation(
    name: string,
    operation: Operation,
    controllerClass: ClassDeclaration
  ) {
    if (operation == null) {
      return;
    }
    console.log('operation type', name);
    controllerClass.getSourceFile().addImportDeclaration({
      namedImports: [capitalize(name)],
      moduleSpecifier: '@nestjs/common'
    });
    const method = controllerClass.addMethod({
      name: operation.operationId || 'operation',
      decorators: [
        {
          name: capitalize(name),
          arguments: []
        }
      ],
      returnType: this.getTypeFromResponses(operation.responses)
    });
    operation.parameters.forEach((parameter: Parameter) => {
      this.testParameter(parameter, method);
    });
    this.testRequestBody(operation.requestBody, method);
  }

  public getTypeFromResponses(responses: Responses) {
    // TODO
    return 'any';
  }

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

  public testParameter(parameter: Parameter, method: MethodDeclaration) {
    const camelName = camelcase(parameter.name);
    const decoratorName = this.getParameterDecorator(parameter);
    const decoratorArgs = [];
    if (camelName !== parameter.name) {
      decoratorArgs.push(parameter.name);
    }
    method.getSourceFile().addImportDeclaration({
      namedImports: [decoratorName],
      moduleSpecifier: '@nestjs/common'
    });
    method.addParameter({
      name: parameter.name,
      decorators: [
        {
          name: decoratorName,
          arguments: decoratorArgs
        }
      ],
      type: this.getTypeFromSchema(parameter.schema)
    });
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

  public testRequestBody(requestBody: RequestBody, method: MethodDeclaration) {}

  public testSchemas() {
    Object.keys(this.openApi.components.schemas).forEach(name => {
      const schema = this.openApi.components.schemas[name];
    });
  }

  public testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(
      `${this.outputPath}/dto/${name}.dto.ts`,
      '',
      {
        overwrite: true
      }
    );
    const schemaClass = tsFile.addClass({
      name: `${name}Dto`,
      isExported: true
    });
    Object.keys(schema.properties).forEach(name => {
      const property = schema.properties[name];
      schemaClass.addProperty({
        name,
        type: property.type
      });
    });
  }
}