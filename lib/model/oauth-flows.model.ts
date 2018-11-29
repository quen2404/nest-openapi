import { OAuthFlow } from './oauth-flow.model';
import { SpecificationExtensions } from './extensions.model';

export class OAuthFlows extends SpecificationExtensions {
  implicit: OAuthFlow;
  password: OAuthFlow;
  clientCredentials: OAuthFlow;
  authorizationCode: OAuthFlow;
}
