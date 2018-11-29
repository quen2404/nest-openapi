import { SpecificationExtensions } from './extensions.model';

export class Example extends SpecificationExtensions {
  summary: string;
  description: string;
  value: any;
  externalValue: string;
}
