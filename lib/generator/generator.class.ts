import { OpenAPI } from '../model';
import { MediaTypeGenerator } from './media-type.generator';
import { OperationGenerator } from './operation.generator';
import { ParameterGenerator } from './parameter.generator';
import { PathGenerator } from './path.generator';
import { RequestBodyGenerator } from './request-body.generator';
import { ResponseGenerator } from './response.generator';
import { SchemaGenerator } from './schema.generator';
import { ModuleGenerator } from './module.generator';
import { GeneratorOptions } from './generator-options.interface';
import { IndexGenerator } from './index.generator';

export class Generator {
  private mediaTypeGen: MediaTypeGenerator;
  private operationGen: OperationGenerator;
  private parameterGen: ParameterGenerator;
  private pathGen: PathGenerator;
  private requestBodyGen: RequestBodyGenerator;
  private responseGen: ResponseGenerator;
  private schemaGen: SchemaGenerator;
  private moduleGen: ModuleGenerator;
  private indexGen: IndexGenerator;

  constructor(private options: GeneratorOptions, private openapi: OpenAPI) {
    this.schemaGen = new SchemaGenerator(options, openapi);
    this.mediaTypeGen = new MediaTypeGenerator(options, openapi, this.schemaGen);
    this.parameterGen = new ParameterGenerator(options, openapi, this.schemaGen);
    this.requestBodyGen = new RequestBodyGenerator(options, openapi, this.mediaTypeGen);
    this.responseGen = new ResponseGenerator(options, openapi, this.mediaTypeGen);
    this.operationGen = new OperationGenerator(
      options,
      openapi,
      this.parameterGen,
      this.requestBodyGen,
      this.responseGen,
    );
    this.pathGen = new PathGenerator(options, openapi, this.operationGen);
    this.moduleGen = new ModuleGenerator(options);
    this.indexGen = new IndexGenerator(options);
  }

  public async generate() {
    const controllers = await this.pathGen.testPaths();
    await this.schemaGen.testSchemas();
    await this.moduleGen.generate(controllers);
    await this.indexGen.generate();
  }
}
