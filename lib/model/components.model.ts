import { Schema } from './schema.model';
import { Response } from './response.model';
import { Parameter } from './parameter.model';
import { Example } from './example.model';
import { RequestBody } from './request-body.model';
import { Header } from './header.model';
import { SecurityScheme } from './security-scheme.model';
import { Link } from './link.model';
import { Callback } from './callback.model';
export class Components {
  schemas: Map<string, Schema>;
  responses: Map<string, Response>;
  parameters: Map<string, Parameter>;
  examples: Map<string, Example>;
  requestBodies: Map<string, RequestBody>;
  headers: Map<string, Header>;
  securitySchemes: Map<string, SecurityScheme>;
  links: Map<string, Link>;
  callbacks: Map<string, Callback>;
}
