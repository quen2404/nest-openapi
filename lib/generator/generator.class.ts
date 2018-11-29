import { OpenAPI } from '../model';
import { MediaTypeGenerator } from './media-type.generator';
import { OperationGenerator } from './operation.generator';
import { ParameterGenerator } from './parameter.generator';
import { PathGenerator } from './path.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';
import { SchemaGenerator } from './schema.generator';
import { ModuleGenerator } from './module.generator';

export class Generator {
  private mediaTypeGen: MediaTypeGenerator;
  private operationGen: OperationGenerator;
  private parameterGen: ParameterGenerator;
  private pathGen: PathGenerator;
  private requestBodyGen: RequestBodyGenerator;
  private responseGen: ResponseGenerator;
  private schemaGen: SchemaGenerator;
  private moduleGen: ModuleGenerator;

  constructor(private outputPath: string, private openapi: OpenAPI) {
    this.schemaGen = new SchemaGenerator(outputPath, openapi);
    this.mediaTypeGen = new MediaTypeGenerator(outputPath, openapi, this.schemaGen);
    this.parameterGen = new ParameterGenerator(outputPath, openapi, this.schemaGen);
    this.requestBodyGen = new RequestBodyGenerator(outputPath, openapi, this.mediaTypeGen);
    this.responseGen = new ResponseGenerator(outputPath, openapi, this.mediaTypeGen);
    this.operationGen = new OperationGenerator(
      outputPath,
      openapi,
      this.parameterGen,
      this.requestBodyGen,
      this.responseGen,
    );
    this.pathGen = new PathGenerator(outputPath, openapi, this.operationGen);
    this.moduleGen = new ModuleGenerator(outputPath);
  }

  public generate() {
    this.pathGen.testPaths();
    this.schemaGen.testSchemas();
    this.moduleGen.generate();
  }
}
