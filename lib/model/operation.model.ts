import { ExternalDocumentation } from './external-doc.model';
import { Parameter } from './parameter.model';
import { RequestBody } from './request-body.model';
import { Responses } from './responses.model';
import { Callback } from './callback.model';
import { SecurityRequirement } from './security-requirement.model';
import { Server } from './server.model';
export interface Operation {
  tags: string[];
  summary: string;
  description: string;
  externalDocs: ExternalDocumentation;
  operationId: string;
  parameters: Parameter[];
  requestBody: RequestBody;
  responses: Responses;
  callbacks: {
    [name: string]: Callback;
  };
  deprecated: boolean;
  security: SecurityRequirement[];
  servers: Server[];
}
