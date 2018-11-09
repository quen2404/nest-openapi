import { Contact } from './contact.model';
import { License } from './license.model';
export interface Info {
  title: string;
  description: string;
  termsOfService: string;
  contact: Contact;
  license: License;
  version: string;
}
