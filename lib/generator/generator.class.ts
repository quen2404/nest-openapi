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

  public extractNameFromPath(path: string): string {
    const re = /[\/\{\}]/gi;
    return path.replace(re, '');
  }

  public formatPath(path: string): string {
    const re = /\{([^/]+)\}/gi;
    return path.replace(re, ':$1');
  }

  public testPaths() {
    this.openApi.paths.forEach((pathItem, path) => {
      console.log('path', path);
      // const pathItem = this.openApi.paths[path];
      const name = this.extractNameFromPath(path);
      const nestPath = this.formatPath(path);
      const tsAstHelper = new TypeScriptAst();
      const serviceFile: SourceFile = tsAstHelper.createSourceFile(
        `${this.outputPath}/services/${name}.interface.ts`,
        '',
        {
          overwrite: true
        }
      );
      const controllerFile: SourceFile = tsAstHelper.createSourceFile(
        `${this.outputPath}/controllers/${name}.controller.ts`,
        '',
        {
          overwrite: true
        }
      );
      controllerFile.addImportDeclaration({
        namedImports: ['Controller'],
        moduleSpecifier: '@nestjs/common'
      });
      const controllerClass: ClassDeclaration = controllerFile.addClass({
        name: `${capitalize(name)}Controller`,
        isExported: true,
        decorators: [
          {
            name: 'Controller',
            arguments: [`'${nestPath}'`]
          }
        ]
      });
      const serviceClass = serviceFile.addInterface({
        name: `${capitalize(name)}Service`,
        isExported: true
      });
      this.testOperation('get', pathItem.get, controllerClass);
      this.testOperation('put', pathItem.put, controllerClass);
      this.testOperation('post', pathItem.post, controllerClass);
      this.testOperation('delete', pathItem.delete, controllerClass);
      this.testOperation('options', pathItem.options, controllerClass);
      this.testOperation('head', pathItem.head, controllerClass);
      this.testOperation('patch', pathItem.patch, controllerClass);
      this.testOperation('trace', pathItem.trace, controllerClass);
      controllerFile.saveSync();
      serviceFile.saveSync();
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
      isAsync: true,
      returnType: this.promisifyType(
        this.getTypeFromResponses(operation.responses)
      )
    });
    operation.parameters.forEach((parameter: Parameter) => {
      this.testParameter(parameter, method);
    });
    this.testRequestBody(operation.requestBody, method);
  }

  public promisifyType(type: string) {
    return `Promise<${type}>`;
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

  public testRequestBody(requestBody: RequestBody, method: MethodDeclaration) {
    if (
      !requestBody ||
      !requestBody.content ||
      !requestBody.content.get('application/json')
    ) {
      return;
    }
    const content = requestBody.content.get('application/json');
    content.schema;
    method.getSourceFile().addImportDeclaration({
      namedImports: ['Body'],
      moduleSpecifier: '@nestjs/common'
    });
    method.addParameter({
      name: 'body',
      decorators: [
        {
          name: 'Body',
          arguments: []
        }
      ],
      type: this.getTypeFromSchema(content.schema)
    });
  }

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
