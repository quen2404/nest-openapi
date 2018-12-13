import { OpenAPI, Response } from '../model';
import { MediaTypeGenerator } from './media-type.generator';
import { SchemaType, TYPE_ANY, TYPE_VOID } from './schema-type.class';

export class ResponseGenerator {
  public constructor(private outputPath: string, private openapi: OpenAPI, private mediaTypeGen: MediaTypeGenerator) {}
  public getTypeFromResponses(responses: Map<string, Response>): SchemaType {
    // TODO
    const count = responses.size - (responses.has('default') ? 1 : 0);
    if (count > 1) {
      // There is more than one type of response, we have to use Response<?>
    }
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
    if (response.headers != null && response.headers.size > 0) {
      // We have to is more than one type of response, we have to use Response<?>
      // type =
    }
    if (type == null) {
      return TYPE_ANY;
    }
    return type;
  }
}
