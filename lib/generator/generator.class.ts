import TypeScriptAst, { SourceFile } from 'ts-simple-ast';
import { OpenAPI } from '../model';
import { SchemaGenerator } from './schema.generator';
import { MediaTypeGenerator } from './media-type.generator';
import { ParameterGenerator } from './parameter.generator';
import { PathGenerator } from './path.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';

export class Generator {
  private mediaTypeGen: MediaTypeGenerator;
  private parameterGen: ParameterGenerator;
  private pathGen: PathGenerator;
  private requestBodyGen: RequestBodyGenerator;
  private responseGen: ResponseGenerator;
  private schemaGen: SchemaGenerator;

  constructor(private outputPath: string, private openapi: OpenAPI) {
    this.schemaGen = new SchemaGenerator(outputPath, openapi);
    this.mediaTypeGen = new MediaTypeGenerator(outputPath, openapi, this.schemaGen);
    this.parameterGen = new ParameterGenerator(outputPath, openapi, this.schemaGen);
    this.requestBodyGen = new RequestBodyGenerator(outputPath, openapi, this.mediaTypeGen);
    this.responseGen = new ResponseGenerator(outputPath, openapi, this.mediaTypeGen);
    this.pathGen = new PathGenerator(outputPath, openapi, this.parameterGen, this.requestBodyGen, this.responseGen);
  }

  public generate() {
    this.pathGen.testPaths();
    this.schemaGen.testSchemas();
  }
}
