import TypeScriptAst, {
  SourceFile,
  ClassDeclaration,
  MethodDeclaration
} from 'ts-simple-ast';
import { OpenAPI } from '../model/openapi.model';
import { Schema } from '../model/schema.model';
import { Operation } from '../model/operation.model';
import { capitalize } from '../utils/capitalize.utils';
import { Parameter } from '../model/parameter.model';
import * as camelcase from 'camelcase';
import { Responses } from '../model/responses.model';
import { RequestBody } from '../model/request-body.model';

export class Generator {
  constructor(private outputPath: string, private openApi: OpenAPI) {
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(outputPath, '', {
      overwrite: true
    });
  }

  public formatPath(path: string): string {
    const re = /\//gi;
    return path.replace(re, '').replace(/\{([^\}\/])\}/gi, ':$1');
  }

  public testPaths() {
    Object.keys(this.openApi.paths).forEach(path => {
      const pathItem = this.openApi.paths[path];
      const name = this.formatPath(path);
      const tsAstHelper = new TypeScriptAst();
      const tsFile: SourceFile = tsAstHelper.createSourceFile(
        `${this.outputPath}/controllers/${name}.dto.ts`,
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
        name: `${name}Controller`,
        isExported: true,
        decorators: [
          {
            name: 'Controller',
            arguments: [path]
          }
        ]
      });
    });
  }

  public testOperation(
    name: string,
    operation: Operation,
    controllerClass: ClassDeclaration
  ) {
    controllerClass.getSourceFile().addImportDeclaration({
      namedImports: [capitalize(name)],
      moduleSpecifier: '@nestjs/common'
    });
    const method = controllerClass.addMethod({
      name: operation.operationId,
      decorators: [
        {
          name: capitalize(name)
        }
      ],
      returnType: this.getTypeFromResponses(operation.responses)
    });
    operation.parameters.forEach(parameter => {
      this.testParameter(parameter, method);
    });
    this.testRequestBody(operation.requestBody, method);
  }

  public getTypeFromResponses(responses: Responses) {
    // TODO
    return 'TODO';
  }

  public testParameter(parameter: Parameter, method: MethodDeclaration) {
    const camelName = camelcase(parameter.name);
    const decoratorArgs = [];
    if (camelName !== parameter.name) {
      decoratorArgs.push(parameter.name);
    }
    method.addParameter({
      name: parameter.name,
      decorators: [
        {
          name: parameter.in,
          arguments: decoratorArgs
        }
      ],
      type: this.getTypeFromSchema(parameter.schema)
    });
  }

  public getTypeFromSchema(schema: Schema): string {
    // TODO
    return 'TODO';
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
