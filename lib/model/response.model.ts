import { MediaType } from './media-type.model';
import { Header } from './header.model';
import { Link } from './link.model';

export interface Response {
  description: string;
  headers: {
    [name: string]: Header;
  };
  content: {
    [name: string]: MediaType;
  };
  links: {
    [name: string]: Link;
  };
}
