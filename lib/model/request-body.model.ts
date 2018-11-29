import { MediaType } from './media-type.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';

export class RequestBody extends SpecificationExtensions {
  description: string;
  @Type(() => MediaType)
  content: Map<string, MediaType>;
  required: boolean;
}
