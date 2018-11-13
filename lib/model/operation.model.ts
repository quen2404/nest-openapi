import { ExternalDocumentation } from './external-doc.model';
import { Parameter } from './parameter.model';
import { RequestBody } from './request-body.model';
import { Responses } from './responses.model';
import { Callback } from './callback.model';
import { SecurityRequirement } from './security-requirement.model';
import { Server } from './server.model';
import { Type, Expose } from 'class-transformer';
export class Operation {
  tags: string[];
  summary: string;
  description: string;
  @Type(() => ExternalDocumentation)
  externalDocs: ExternalDocumentation;
  operationId: string;
  @Expose({ name: 'parameters' })
  @Type(() => Parameter)
  _parameters: Parameter[];
  @Type(() => RequestBody)
  requestBody: RequestBody;
  @Type(() => Responses)
  responses: Responses;
  @Type(() => Callback)
  callbacks: Map<string, Callback>;
  deprecated: boolean;
  @Type(() => SecurityRequirement)
  security: SecurityRequirement[];
  @Type(() => Server)
  servers: Server[];

  public get parameters() {
    return this._parameters || [];
  }
}
