import { SpecificationExtensions } from './extensions.model';

export class Xml extends SpecificationExtensions {
  name: string;
  namespace: string;
  prefix: string;
  attribute: boolean;
  wrapped: boolean;
}
