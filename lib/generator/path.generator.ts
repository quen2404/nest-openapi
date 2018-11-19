import { OpenAPI, Operation, Parameter } from '../model';
import TypeScriptAst, {
  SourceFile,
  ClassDeclaration,
  Scope,
  InterfaceDeclaration,
  CodeBlockWriter,
} from 'ts-simple-ast';
import * as camelcase from 'camelcase';
import { capitalize } from '../utils';
import { ParameterGenerator } from './parameter.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';

export class PathGenerator {
  constructor(
    private outputPath: string,
    private openapi: OpenAPI,
    private parameterGen: ParameterGenerator,
    private requestBodyGen: RequestBodyGenerator,
    private responseGen: ResponseGenerator,
  ) {}

  public extractNameFromPath(path: string): string {
    const re = /[\/\{\}]/gi;
    return path.replace(re, '');
  }

  public formatPath(path: string): string {
    const re = /\{([^/]+)\}/gi;
    return path.replace(re, ':$1');
  }

  public testPaths() {
    this.openapi.paths.forEach((pathItem, path) => {
      console.log('path', path);
      // const pathItem = this.openapi.paths[path];
      const name = this.extractNameFromPath(path);
      const nestPath = this.formatPath(path);
      const tsAstHelper = new TypeScriptAst();
      const serviceFileName = `services/${name}.interface`;
      const serviceFile: SourceFile = tsAstHelper.createSourceFile(`${this.outputPath}/${serviceFileName}.ts`, '', {
        overwrite: true,
      });
      const controllerFileName = `controllers/${name}.controller`;
      const controllerFile: SourceFile = tsAstHelper.createSourceFile(
        `${this.outputPath}/${controllerFileName}.ts`,
        '',
        {
          overwrite: true,
        },
      );
      controllerFile.addImportDeclaration({
        namedImports: ['Controller'],
        moduleSpecifier: '@nestjs/common',
      });
      const serviceClassName = `${capitalize(name)}Service`;
      const serviceName = camelcase(serviceClassName);
      const controllerClass: ClassDeclaration = controllerFile.addClass({
        name: `${capitalize(name)}Controller`,
        isExported: true,
        decorators: [
          {
            name: 'Controller',
            arguments: [`'${nestPath}'`],
          },
        ],
        ctors: [
          {
            parameters: [
              {
                name: serviceName,
                type: serviceClassName,
                isReadonly: true,
                scope: Scope.Private,
              },
            ],
          },
        ],
      });
      controllerFile.addImportDeclaration({
        namedImports: [serviceClassName],
        moduleSpecifier: `../${serviceFileName}`,
      });
      const serviceClass = serviceFile.addInterface({
        name: serviceClassName,
        isExported: true,
      });
      this.testOperation('get', pathItem.get, controllerClass, serviceClass);
      this.testOperation('put', pathItem.put, controllerClass, serviceClass);
      this.testOperation('post', pathItem.post, controllerClass, serviceClass);
      this.testOperation('delete', pathItem.delete, controllerClass, serviceClass);
      this.testOperation('options', pathItem.options, controllerClass, serviceClass);
      this.testOperation('head', pathItem.head, controllerClass, serviceClass);
      this.testOperation('patch', pathItem.patch, controllerClass, serviceClass);
      this.testOperation('trace', pathItem.trace, controllerClass, serviceClass);
      controllerFile.organizeImports().saveSync();
      serviceFile.organizeImports().saveSync();
    });
  }

  public testOperation(
    name: string,
    operation: Operation,
    controllerClass: ClassDeclaration,
    serviceClass: InterfaceDeclaration,
  ) {
    if (operation == null) {
      return;
    }
    const methodName = operation.operationId || 'operation';
    console.log('operation type', name);
    controllerClass.getSourceFile().addImportDeclaration({
      namedImports: [capitalize(name)],
      moduleSpecifier: '@nestjs/common',
    });
    const responseType = this.responseGen.getTypeFromResponses(operation.responses);
    if (responseType.needImport) {
      controllerClass.getSourceFile().addImportDeclaration(responseType.getImportDeclaration());
      serviceClass.getSourceFile().addImportDeclaration(responseType.getImportDeclaration());
    }
    const methodController = controllerClass.addMethod({
      name: methodName,
      decorators: [
        {
          name: capitalize(name),
          arguments: [],
        },
      ],
      isAsync: true,
      returnType: responseType.promisifyName,
    });
    const methodService = serviceClass.addMethod({
      name: methodName,
      returnType: responseType.promisifyName,
    });
    operation.parameters.forEach((parameter: Parameter) => {
      this.parameterGen.testParameter(parameter, methodController, methodService);
    });
    this.requestBodyGen.testRequestBody(operation.requestBody, methodController, methodService);
    methodController.setBodyText((write: CodeBlockWriter) => {
      const parameters = methodController
        .getParameters()
        .map(param => param.getName())
        .join(', ');
      write.write(`return await this.${camelcase(serviceClass.getName())}.${methodName}(${parameters});`);
    });
  }
}
