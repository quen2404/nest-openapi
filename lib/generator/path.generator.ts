import * as camelcase from 'camelcase';
import TypeScriptAst, { Scope, SourceFile } from 'ts-simple-ast';
import { OpenAPI, PathItem } from '../model';
import { capitalize, camelToKebab } from '../utils';
import { OperationGenerator } from './operation.generator';
import { GeneratorOptions } from './generator-options.interface';
import { ControllerInterface } from './controller.interface';

export class PathGenerator {
  private tsAstHelper = new TypeScriptAst();
  private controllersClasses = new Map<string, SourceFile>();
  private servicesClasses = new Map<string, SourceFile>();

  constructor(private options: GeneratorOptions, private openapi: OpenAPI, private operationGen: OperationGenerator) {}

  public extractNameFromPath(path: string): string {
    const re = /[\/\{\}]/gi;
    return path.replace(re, '');
  }

  public extractFileNameFromPath(path: string): string {
    return camelToKebab(camelcase(this.extractNameFromPath(path)));
  }

  public formatPath(path: string): string {
    const re = /\{([^/]+)\}/gi;
    return path.replace(re, ':$1');
  }

  public extractParentPath(path: string): string {
    const parts = path.substr(1).split('/');
    return parts.shift();
  }

  public extractChildPath(path: string): string {
    const parts = path.substr(1).split('/');
    parts.shift();
    return parts.join('/').replace(/\{([^\/]+)\}/gi, ':$1');
  }

  public async testPaths(): Promise<ControllerInterface[]> {
    this.openapi.paths.forEach((pathItem, path) => {
      const formalizedPath = this.extractParentPath(path);
      const name = this.extractNameFromPath(formalizedPath);
      const fileName = this.extractFileNameFromPath(formalizedPath);
      const serviceFile = this.getOrCreateSourceFile(
        this.servicesClasses,
        formalizedPath,
        `services/${fileName}.interface`,
      );
      const controllerFile = this.getOrCreateSourceFile(
        this.controllersClasses,
        formalizedPath,
        `controllers/${fileName}.controller`,
      );
      const serviceClassName = `I${capitalize(name)}Service`;
      const serviceFileName = `services/${name}.interface`;
      controllerFile.addImportDeclaration({
        namedImports: [serviceClassName],
        moduleSpecifier: `../${serviceFileName}`,
      });
    });
    this.openapi.paths.forEach((pathItem, path) => this.testPath(path, pathItem));
    this.controllersClasses.forEach(async sourceFile => await sourceFile.organizeImports().save());
    this.servicesClasses.forEach(async sourceFile => await sourceFile.organizeImports().save());
    const controllerClassNames: ControllerInterface[] = [];
    this.controllersClasses.forEach(source =>
      controllerClassNames.push({
        className: source.getClasses()[0].getName(),
        path: source.getFilePath(),
      }),
    );
    return controllerClassNames;
  }

  public getOrCreateSourceFile(sourceFiles: Map<string, SourceFile>, path: string, template: string): SourceFile {
    if (sourceFiles.has(path)) {
      return sourceFiles.get(path);
    }
    const sourceFile = this.tsAstHelper.createSourceFile(`${this.options.outputPath}/${template}.ts`, '', {
      overwrite: true,
    });
    sourceFiles.set(path, sourceFile);
    return sourceFile;
  }

  public testPath(path: string, pathItem: PathItem) {
    const parentPath = this.extractParentPath(path);
    const childPath = this.extractChildPath(path);
    const name = this.extractNameFromPath(parentPath);
    const fileName = this.extractFileNameFromPath(parentPath);
    const nestPath = this.formatPath(parentPath);
    const serviceFile = this.getOrCreateSourceFile(this.servicesClasses, parentPath, `services/${fileName}.interface`);
    const controllerFile = this.getOrCreateSourceFile(
      this.controllersClasses,
      parentPath,
      `controllers/${fileName}.controller`,
    );
    controllerFile.addImportDeclaration({
      namedImports: ['Controller', 'Inject'],
      moduleSpecifier: '@nestjs/common',
    });
    const controllerClassName = `${capitalize(name)}Controller`;
    const serviceName = `${capitalize(name)}Service`;
    const serviceClassName = `I${serviceName}`;
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
                name: camelcase(serviceName),
                type: serviceClassName,
                isReadonly: true,
                scope: Scope.Private,
                decorators: [
                  {
                    name: 'Inject',
                    arguments: [`'${serviceName}'`],
                  },
                ],
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
    this.operationGen.testOperation('get', pathItem.get, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('put', pathItem.put, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('post', pathItem.post, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('delete', pathItem.delete, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('options', pathItem.options, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('head', pathItem.head, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('patch', pathItem.patch, controllerClass, serviceClass, childPath);
    this.operationGen.testOperation('trace', pathItem.trace, controllerClass, serviceClass, childPath);
  }
}
