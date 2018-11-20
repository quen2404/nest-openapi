import * as camelcase from 'camelcase';
import { ClassDeclaration, CodeBlockWriter, InterfaceDeclaration } from 'ts-simple-ast';
import { OpenAPI, Operation, Parameter } from '../model';
import { capitalize } from '../utils';
import { ParameterGenerator } from './parameter.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';

export class OperationGenerator {
  constructor(
    private outputPath: string,
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
    if (responseType.needImport) {
      controllerClass.getSourceFile().addImportDeclaration(responseType.getImportDeclaration());
      serviceClass.getSourceFile().addImportDeclaration(responseType.getImportDeclaration());
    }
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
