import * as camelcase from 'camelcase';
import { ClassDeclaration, CodeBlockWriter, InterfaceDeclaration } from 'ts-simple-ast';
import { OpenAPI, Operation, Parameter } from '../model';
import { capitalize } from '../utils';
import { ParameterGenerator } from './parameter.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';
import { GeneratorOptions } from './generator-options.interface';
import { TsDoc } from './tsdoc.class';

export class OperationGenerator {
  constructor(
    private options: GeneratorOptions,
    private openapi: OpenAPI,
    private parameterGen: ParameterGenerator,
    private requestBodyGen: RequestBodyGenerator,
    private responseGen: ResponseGenerator,
  ) {}

  public testOperation(
    name: string,
    operation: Operation,
    controllerClass: ClassDeclaration,
    serviceClass: InterfaceDeclaration,
    lastSegment?: string,
  ) {
    if (operation == null) {
      return;
    }
    const methodName = operation.operationId || 'operation';
    controllerClass.getSourceFile().addImportDeclaration({
      namedImports: [capitalize(name)],
      moduleSpecifier: '@nestjs/common',
    });
    const responseType = this.responseGen.getTypeFromResponses(operation.responses);
    controllerClass.getSourceFile().addImportDeclarations(responseType.getImportDeclarations());
    serviceClass.getSourceFile().addImportDeclarations(responseType.getImportDeclarations());
    const decoratorArguments: string[] = [];
    if (lastSegment) {
      decoratorArguments.push(`'${lastSegment}'`);
    }
    const methodController = controllerClass.addMethod({
      name: methodName,
      decorators: [
        {
          name: capitalize(name),
          arguments: decoratorArguments,
        },
      ],
      isAsync: true,
      returnType: responseType.type,
    });
    const doc = new TsDoc();
    doc.deprecated = operation.deprecated;
    doc.summary = operation.summary;
    doc.description = operation.description;

    const methodService = serviceClass.addMethod({
      name: methodName,
      returnType: responseType.type,
    });
    operation.parameters.forEach((parameter: Parameter) => {
      this.parameterGen.testParameter(parameter, methodController, methodService);
      doc.parameters.push({
        name: parameter.name,
        description: parameter.description,
      });
    });
    this.requestBodyGen.testRequestBody(operation.requestBody, methodController, methodService);
    methodController.setBodyText((write: CodeBlockWriter) => {
      const parameters = methodController
        .getParameters()
        .map(param => param.getName())
        .join(', ');
      const serviceVariableName = controllerClass
        .getConstructors()[0]
        .getParameters()[0]
        .getName();
      write.write(`return await this.${serviceVariableName}.${methodName}(${parameters});`);
    });
    if (doc.toString().trim().length > 0) {
      methodController.addJsDoc(doc.toString());
    }
  }
}
