import { Server } from './server.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';

export class Link extends SpecificationExtensions {
  operationRef: string;
  operationId: string;
  parameters: Map<string, any>;
  requestBody: any;
  description: string;
  @Type(() => Server)
  server: Server;
}
