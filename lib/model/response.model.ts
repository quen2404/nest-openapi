import { MediaType } from './media-type.model';
import { Header } from './header.model';
import { Link } from './link.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';

export class Response extends SpecificationExtensions {
  description: string;
  @Type(() => Header)
  headers: Map<string, Header>;
  @Type(() => MediaType)
  content: Map<string, MediaType>;
  @Type(() => Link)
  links: Map<string, Link>;
}
