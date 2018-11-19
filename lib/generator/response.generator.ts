import { OpenAPI, Response } from '../model';
import { MediaTypeGenerator } from './media-type.generator';
import { SchemaType, TYPE_ANY, TYPE_VOID } from './schema-type.class';

export class ResponseGenerator {
  public constructor(private outputPath: string, private openapi: OpenAPI, private mediaTypeGen: MediaTypeGenerator) {}
  public getTypeFromResponses(responses: Map<string, Response>): SchemaType {
    // TODO
    let type: SchemaType = null;
    if (responses != null) {
      responses.forEach((response, code) => {
        if (code.startsWith('2') && type == null) {
          if (code !== '204') {
            type = this.getTypeFromResponse(response);
          } else {
            type = TYPE_VOID;
          }
        }
      });
    }
    if (type == null) {
      return TYPE_ANY;
    }
    return type;
  }

  public getTypeFromResponse(response: Response): SchemaType {
    let type: SchemaType = null;
    if (response.content != null) {
      type = this.mediaTypeGen.getTypeFromMediaType(response.content.get('application/json'));
    }
    if (type == null) {
      return TYPE_ANY;
    }
    return type;
  }
}
