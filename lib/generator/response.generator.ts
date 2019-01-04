import { OpenAPI, Response } from '../model';
import { MediaTypeGenerator } from './media-type.generator';
import { TYPE_ANY, TYPE_VOID } from './schema-type.class';
import { ResponseType } from './response-type.class';
import { GeneratorOptions } from './generator-options.interface';

export class ResponseGenerator {
  public constructor(
    private options: GeneratorOptions,
    private openapi: OpenAPI,
    private mediaTypeGen: MediaTypeGenerator,
  ) {}
  public getTypeFromResponses(responses: Map<string, Response>): ResponseType {
    // TODO
    const count = responses.size - (responses.has('default') ? 1 : 0);
    if (count > 1) {
      // There is more than one type of response, we have to use Response<?>
    }
    let type: ResponseType = new ResponseType(TYPE_ANY);
    if (responses != null) {
      responses.forEach((response, code) => {
        if (code.startsWith('2') && type == null) {
          if (code !== '204') {
            type = this.getTypeFromResponse(response);
          } else {
            type = new ResponseType(TYPE_VOID);
          }
        }
      });
    }
    return type;
  }

  public getTypeFromResponse(response: Response): ResponseType {
    let schema = TYPE_ANY;
    if (response.content != null) {
      schema = this.mediaTypeGen.getSchemaType(response.content.get('application/json'));
    }
    const type = new ResponseType(schema);
    if (response.headers != null && response.headers.size > 0) {
      // We have to is more than one type of response, we have to use Response<?>
      type.responseContainer = true;
    }
    return type;
  }
}
