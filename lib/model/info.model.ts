import { Contact } from './contact.model';
import { License } from './license.model';
import { SpecificationExtensions } from './extensions.model';
export class Info extends SpecificationExtensions {
  title: string;
  description: string;
  termsOfService: string;
  contact: Contact;
  license: License;
  version: string;
}
