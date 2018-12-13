import * as camelcase from 'camelcase';
import TypeScriptAst, { Scope, SourceFile } from 'ts-simple-ast';
import { OpenAPI, PathItem } from '../model';
import { capitalize } from '../utils';
import { OperationGenerator } from './operation.generator';

export class PathGenerator {
  private tsAstHelper = new TypeScriptAst();
  private controllersClasses = new Map<string, SourceFile>();
  private servicesClasses = new Map<string, SourceFile>();

  constructor(private outputPath: string, private openapi: OpenAPI, private operationGen: OperationGenerator) {
    this.tsAstHelper = new TypeScriptAst();
  }

  public extractNameFromPath(path: string): string {
    const re = /[\/\{\}]/gi;
    return path.replace(re, '');
  }

  public formatPath(path: string): string {
    const re = /\{([^/]+)\}/gi;
    return path.replace(re, ':$1');
  }

  public removeLastSegment(path: string): string {
    const re = /^(.*)\/\{([^\/]+)\}$/gi;
    return path.replace(re, '$1');
  }

  public extractLastSegment(path: string): string {
    const re = /^(.*)\/\{([^\/]+)\}$/gi;
    const extract = path.replace(re, ':$2');
    if (extract.startsWith(':')) {
      return extract;
    }
    return null;
  }

  public testPaths() {
    this.openapi.paths.forEach((pathItem, path) => {
      const name = this.extractNameFromPath(path);
      const formalizedPath = this.removeLastSegment(path);
      const serviceFile = this.getOrCreateSourceFile(
        this.servicesClasses,
        formalizedPath,
        `services/${name}.interface`,
      );
      const controllerFile = this.getOrCreateSourceFile(
        this.controllersClasses,
        formalizedPath,
        `controllers/${name}.controller`,
      );
      const serviceClassName = `${capitalize(name)}Service`;
      const serviceFileName = `services/${name}.interface`;
      controllerFile.addImportDeclaration({
        namedImports: [serviceClassName],
        moduleSpecifier: `../${serviceFileName}`,
      });
    });
    this.openapi.paths.forEach((pathItem, path) => {
      let formalizedPath = this.removeLastSegment(path);
      let lastSegment = null;
      if (this.openapi.paths.has(formalizedPath)) {
        lastSegment = this.extractLastSegment(path);
      }
      this.testPath(formalizedPath, pathItem, lastSegment);
    });
    this.controllersClasses.forEach(async sourceFile => await sourceFile.organizeImports().save());
    this.servicesClasses.forEach(async sourceFile => await sourceFile.organizeImports().save());
  }

  public getOrCreateSourceFile(sourceFiles: Map<string, SourceFile>, path: string, template: string): SourceFile {
    if (sourceFiles.has(path)) {
      return sourceFiles.get(path);
    }
    const sourceFile = this.tsAstHelper.createSourceFile(`${this.outputPath}/${template}.ts`, '', {
      overwrite: true,
    });
    sourceFiles.set(path, sourceFile);
    return sourceFile;
  }

  public testPath(path: string, pathItem: PathItem, lastSegment?: string) {
    const name = this.extractNameFromPath(path);
    const nestPath = this.formatPath(path);
    const serviceFile = this.getOrCreateSourceFile(this.servicesClasses, path, `services/${name}.interface`);
    const controllerFile = this.getOrCreateSourceFile(this.controllersClasses, path, `controllers/${name}.controller`);
    controllerFile.addImportDeclaration({
      namedImports: ['Controller'],
      moduleSpecifier: '@nestjs/common',
    });
    const controllerClassName = `${capitalize(name)}Controller`;
    const serviceClassName = `${capitalize(name)}Service`;
    const serviceName = camelcase(serviceClassName);
    let controllerClass = controllerFile.getClass(controllerClassName);
    if (controllerClass == null) {
      controllerClass = controllerFile.addClass({
        name: controllerClassName,
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
    }
    let serviceClass = serviceFile.getInterface(serviceClassName);
    if (serviceClass == null) {
      serviceClass = serviceFile.addInterface({
        name: serviceClassName,
        isExported: true,
      });
    }
    this.operationGen.testOperation('get', pathItem.get, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('put', pathItem.put, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('post', pathItem.post, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('delete', pathItem.delete, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('options', pathItem.options, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('head', pathItem.head, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('patch', pathItem.patch, controllerClass, serviceClass, lastSegment);
    this.operationGen.testOperation('trace', pathItem.trace, controllerClass, serviceClass, lastSegment);
  }
}
