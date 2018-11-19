import * as camelcase from 'camelcase';
import TypeScriptAst, { ClassDeclaration, Scope, SourceFile } from 'ts-simple-ast';
import { OpenAPI } from '../model';
import { capitalize } from '../utils';
import { OperationGenerator } from './operation.generator';

export class PathGenerator {
  constructor(private outputPath: string, private openapi: OpenAPI, private operationGen: OperationGenerator) {}

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
      this.operationGen.testOperation('get', pathItem.get, controllerClass, serviceClass);
      this.operationGen.testOperation('put', pathItem.put, controllerClass, serviceClass);
      this.operationGen.testOperation('post', pathItem.post, controllerClass, serviceClass);
      this.operationGen.testOperation('delete', pathItem.delete, controllerClass, serviceClass);
      this.operationGen.testOperation('options', pathItem.options, controllerClass, serviceClass);
      this.operationGen.testOperation('head', pathItem.head, controllerClass, serviceClass);
      this.operationGen.testOperation('patch', pathItem.patch, controllerClass, serviceClass);
      this.operationGen.testOperation('trace', pathItem.trace, controllerClass, serviceClass);
      controllerFile.organizeImports().saveSync();
      serviceFile.organizeImports().saveSync();
    });
  }
}
