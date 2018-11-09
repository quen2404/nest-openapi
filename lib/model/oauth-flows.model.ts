import { OAuthFlow } from './oauth-flow.model';

export interface OAuthFlows {
  implicit: OAuthFlow;
  password: OAuthFlow;
  clientCredentials: OAuthFlow;
  authorizationCode: OAuthFlow;
}
