import { ExternalDocumentation } from './external-doc.model';

export interface Tag {
  name: string;
  description: string;
  externalDocs: ExternalDocumentation;
}
