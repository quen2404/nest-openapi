import { Header } from './header.model';
import { Style } from './parameter.model';
export interface Encoding {
  contentType: string;
  headers: {
    [name: string]: Header;
  };
  style: Style;
  explode: boolean;
  allowReserved: boolean;
}
