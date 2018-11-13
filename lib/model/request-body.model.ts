import { MediaType } from './media-type.model';
import { Type } from 'class-transformer';

export class RequestBody {
  description: string;
  @Type(() => MediaType)
  content: Map<string, MediaType>;
  required: boolean;
}
