import { Info } from './info.model';
import { Server } from './server.model';
import { Paths } from './paths.model';
import { SecurityRequirement } from './security-requirement.model';
import { Tag } from './tag.model';
import { ExternalDocumentation } from './external-doc.model';
import { Components } from './components.model';
export interface OpenAPI {
  openapi: string;
  info: Info;
  servers: Server[];
  paths: Paths;
  components: Components;
  security: SecurityRequirement[];
  tags: Tag[];
  externalDocs: ExternalDocumentation;
}
