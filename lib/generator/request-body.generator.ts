import { MethodDeclaration, MethodSignature } from 'ts-simple-ast';
import { OpenAPI, RequestBody } from '../model';
import { MediaTypeGenerator } from './media-type.generator';

export class RequestBodyGenerator {
  public constructor(private outputPath: string, private openapi: OpenAPI, private mediaTypeGen: MediaTypeGenerator) {}
  public testRequestBody(
    requestBody: RequestBody,
    methodController: MethodDeclaration,
    methodService: MethodSignature,
  ) {
    if (!requestBody || !requestBody.content || !requestBody.content.get('application/json')) {
      return;
    }
    const schemaType = this.mediaTypeGen.getTypeFromMediaType(requestBody.content.get('application/json'));
    methodController.getSourceFile().addImportDeclaration({
      namedImports: ['Body'],
      moduleSpecifier: '@nestjs/common',
    });
    if (schemaType.needImport) {
      methodController.getSourceFile().addImportDeclarations(schemaType.getImportDeclarations());
      methodService.getSourceFile().addImportDeclarations(schemaType.getImportDeclarations());
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
}
