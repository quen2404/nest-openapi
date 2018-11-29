import { Header } from './header.model';
import { Style } from './parameter.model';
import { Type } from 'class-transformer';
import { SpecificationExtensions } from './extensions.model';
export class Encoding extends SpecificationExtensions {
  contentType: string;
  @Type(() => Header)
  headers: Map<string, Header>;
  style: Style;
  explode: boolean;
  allowReserved: boolean;
}
