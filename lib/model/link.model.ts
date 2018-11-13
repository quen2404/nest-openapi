import { Server } from './server.model';
import { Type } from 'class-transformer';

export class Link {
  operationRef: string;
  operationId: string;
  parameters: Map<string, any>;
  requestBody: any;
  description: string;
  @Type(() => Server)
  server: Server;
}
