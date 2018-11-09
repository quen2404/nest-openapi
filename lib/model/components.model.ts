import { Schema } from './schema.model';
import { Response } from './response.model';
import { Parameter } from './parameter.model';
import { Example } from './example.model';
import { RequestBody } from './request-body.model';
import { Header } from './header.model';
import { SecurityScheme } from './security-scheme.model';
import { Link } from './link.model';
import { Callback } from './callback.model';
export interface Components {
  schemas: { [key: string]: Schema };
  responses: { [key: string]: Response };
  parameters: { [key: string]: Parameter };
  examples: { [key: string]: Example };
  requestBodies: { [key: string]: RequestBody };
  headers: { [key: string]: Header };
  securitySchemes: { [key: string]: SecurityScheme };
  links: { [key: string]: Link };
  callbacks: { [key: string]: Callback };
}
