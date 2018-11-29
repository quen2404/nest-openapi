import { ServerVariable } from './server-variable.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';
export class Server extends SpecificationExtensions {
  url: string;
  description: string;
  @Type(() => ServerVariable)
  variables: Map<string, ServerVariable>;
}
