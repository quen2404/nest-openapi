import { ServerVariable } from './server-variable.model';
import { Type } from 'class-transformer';
export class Server {
  url: string;
  description: string;
  @Type(() => ServerVariable)
  variables: Map<string, ServerVariable>;
}
