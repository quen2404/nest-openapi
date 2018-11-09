import { Info } from './info.model';
import { Server } from './server.model';
import { Paths } from './paths.model';
import { SecurityRequirement } from './security-requirement.model';
import { Tag } from './tag.model';
import { ExternalDocumentation } from './external-doc.model';
export interface OpenAPI {
  openapi: string;
  info: Info;
  servers: Server[];
  paths: Paths;
  security: SecurityRequirement[];
  tags: Tag[];
  externalDocs: ExternalDocumentation;
}
