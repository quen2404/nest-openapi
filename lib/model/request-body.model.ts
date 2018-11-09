import { MediaType } from './media-type.model';

export interface RequestBody {
  description: string;
  content: {
    [name: string]: MediaType;
  };
  required: boolean;
}
