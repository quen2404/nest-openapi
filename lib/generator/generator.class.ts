import TypeScriptAst, {
  SourceFile,
  ClassDeclaration,
  MethodDeclaration,
  CodeBlockWriter,
  Scope,
  InterfaceDeclaration,
  MethodSignature,
} from 'ts-simple-ast';
import * as camelcase from 'camelcase';
import { OpenAPI, Schema, Operation, Parameter, In, Responses, RequestBody } from '../model';
import { capitalize } from '../utils';
import { SchemaGenerator } from './schema.generator';

export class Generator {
  private schemaGen: SchemaGenerator;
  constructor(private outputPath: string, private openApi: OpenAPI) {
    this.schemaGen = new SchemaGenerator(outputPath, openApi);
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(outputPath, '', {
      overwrite: true,
    });
  }

  public generate() {
    this.testPaths();
    this.schemaGen.testSchemas();
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
    const methodController = controllerClass.addMethod({
      name: methodName,
      decorators: [
        {
          name: capitalize(name),
          arguments: [],
        },
      ],
      isAsync: true,
      returnType: this.promisifyType(this.getTypeFromResponses(operation.responses)),
    });
    const methodService = serviceClass.addMethod({
      name: methodName,
      returnType: this.promisifyType(this.getTypeFromResponses(operation.responses)),
    });
    operation.parameters.forEach((parameter: Parameter) => {
      this.testParameter(parameter, methodController, methodService);
    });
    this.testRequestBody(operation.requestBody, methodController, methodService);
    methodController.setBodyText((write: CodeBlockWriter) => {
      const parameters = methodController
        .getParameters()
        .map(param => param.getName())
        .join(', ');
      write.write(`this.${camelcase(serviceClass.getName())}.${methodName}(${parameters});`);
    });
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
      methodController.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
      methodService.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
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

  public testRequestBody(
    requestBody: RequestBody,
    methodController: MethodDeclaration,
    methodService: MethodSignature,
  ) {
    if (!requestBody || !requestBody.content || !requestBody.content.get('application/json')) {
      return;
    }
    const content = requestBody.content.get('application/json');
    content.schema;
    methodController.getSourceFile().addImportDeclaration({
      namedImports: ['Body'],
      moduleSpecifier: '@nestjs/common',
    });
    const schemaType = this.schemaGen.getSchemaType(content.schema);
    if (schemaType.needImport) {
      console.log('need import !:', schemaType.type);
      methodController.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
      methodService.getSourceFile().addImportDeclaration(schemaType.getImportDeclaration());
    }
    methodController.addParameter({
      name: 'body',
      decorators: [
        {
          name: 'Body',
          arguments: [],
        },
      ],
      type: schemaType.type,
    });
    methodService.addParameter({
      name: 'body',
      type: schemaType.type,
    });
  }

  public testSchemas() {
    Object.keys(this.openApi.components.schemas).forEach(name => {
      const schema = this.openApi.components.schemas[name];
    });
  }

  public testSchema(name: string, schema: Schema) {
    const tsAstHelper = new TypeScriptAst();
    const tsFile: SourceFile = tsAstHelper.createSourceFile(`${this.outputPath}/dto/${name}.dto.ts`, '', {
      overwrite: true,
    });
    const schemaClass = tsFile.addClass({
      name: `${name}Dto`,
      isExported: true,
    });
    Object.keys(schema.properties).forEach(name => {
      const property = schema.properties[name];
      schemaClass.addProperty({
        name,
        type: property.type,
      });
    });
  }
}
