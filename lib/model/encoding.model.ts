import { Header } from './header.model';
import { Style } from './parameter.model';
import { Type } from 'class-transformer';
export class Encoding {
  contentType: string;
  @Type(() => Header)
  headers: Map<string, Header>;
  style: Style;
  explode: boolean;
  allowReserved: boolean;
}
