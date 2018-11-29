import { Info } from './info.model';
import { Server } from './server.model';
import { SecurityRequirement } from './security-requirement.model';
import { Tag } from './tag.model';
import { ExternalDocumentation } from './external-doc.model';
import { Components } from './components.model';
import { Type, Expose } from 'class-transformer';
import { PathItem } from './path-item.model';
import { SpecificationExtensions } from './extensions.model';

export class OpenAPI extends SpecificationExtensions {
  openapi: string;
  @Type(() => Info)
  info: Info;
  @Type(() => Server)
  servers: Server[];
  @Type(() => PathItem)
  paths: Map<string, PathItem>;
  @Type(() => Components)
  components: Components;
  @Type(() => SecurityRequirement)
  security: SecurityRequirement[];
  @Type(() => Tag)
  tags: Tag[];
  @Type(() => ExternalDocumentation)
  externalDocs: ExternalDocumentation;
}
