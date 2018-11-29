import { ExternalDocumentation } from './external-doc.model';
import { SpecificationExtensions } from './extensions.model';

export class Tag extends SpecificationExtensions {
  name: string;
  description: string;
  externalDocs: ExternalDocumentation;
}
