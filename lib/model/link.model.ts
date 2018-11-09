import { Server } from './server.model';

export interface Link {
  operationRef: string;
  operationId: string;
  parameters: {
    [name: string]: any;
  };
  requestBody: any;
  description: string;
  server: Server;
}
