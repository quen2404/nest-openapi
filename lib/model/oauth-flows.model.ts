import { OAuthFlow } from './oauth-flow.model';

export class OAuthFlows {
  implicit: OAuthFlow;
  password: OAuthFlow;
  clientCredentials: OAuthFlow;
  authorizationCode: OAuthFlow;
}
