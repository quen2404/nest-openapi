import { SpecificationExtensions } from './extensions.model';

export class ServerVariable extends SpecificationExtensions {
  enum: string[];
  default: string;
  1;
  description: string;
}
