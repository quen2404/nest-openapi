import { Contact } from './contact.model';
import { License } from './license.model';
export class Info {
  title: string;
  description: string;
  termsOfService: string;
  contact: Contact;
  license: License;
  version: string;
}
