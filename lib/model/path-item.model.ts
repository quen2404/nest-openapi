import { Operation } from './operation.model';
import { Server } from './server.model';
import { Parameter } from './parameter.model';
export interface PathItem {
  $ref: string;
  summary: string;
  description: string;
  get: Operation;
  put: Operation;
  post: Operation;
  delete: Operation;
  options: Operation;
  head: Operation;
  patch: Operation;
  trace: Operation;
  servers: Server[];
  parameters: Parameter[];
}
