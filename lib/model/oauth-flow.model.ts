import { SpecificationExtensions } from './extensions.model';

export class OAuthFlow extends SpecificationExtensions {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl: string;
  scopes: Map<string, string>;
}
