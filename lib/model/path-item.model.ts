import { Operation } from './operation.model';
import { Server } from './server.model';
import { Parameter } from './parameter.model';
import { Type } from 'class-transformer';
export class PathItem {
  $ref: string;
  summary: string;
  description: string;
  @Type(() => Operation)
  get: Operation;
  @Type(() => Operation)
  put: Operation;
  @Type(() => Operation)
  post: Operation;
  @Type(() => Operation)
  delete: Operation;
  @Type(() => Operation)
  options: Operation;
  @Type(() => Operation)
  head: Operation;
  @Type(() => Operation)
  patch: Operation;
  @Type(() => Operation)
  trace: Operation;
  @Type(() => Server)
  servers: Server[];
  @Type(() => Parameter)
  parameters: Parameter[];
}
