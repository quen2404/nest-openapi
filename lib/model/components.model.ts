import { Schema } from './schema.model';
import { Response } from './response.model';
import { Parameter } from './parameter.model';
import { Example } from './example.model';
import { RequestBody } from './request-body.model';
import { Header } from './header.model';
import { SecurityScheme } from './security-scheme.model';
import { Link } from './link.model';
import { Callback } from './callback.model';
import { Type } from 'class-transformer';
export class Components {
  @Type(() => Schema)
  schemas: Map<string, Schema>;
  @Type(() => Response)
  responses: Map<string, Response>;
  @Type(() => Parameter)
  parameters: Map<string, Parameter>;
  @Type(() => Example)
  examples: Map<string, Example>;
  @Type(() => RequestBody)
  requestBodies: Map<string, RequestBody>;
  @Type(() => Header)
  headers: Map<string, Header>;
  @Type(() => SecurityScheme)
  securitySchemes: Map<string, SecurityScheme>;
  @Type(() => Link)
  links: Map<string, Link>;
  @Type(() => Callback)
  callbacks: Map<string, Callback>;
}
