import { OAuthFlows } from './oauth-flows.model';

export class SecurityScheme {
  type: string;
  description: string;
  name: string;
  in: string;
  scheme: string;
  bearerFormat: string;
  flows: OAuthFlows;
  openIdConnectUrl: string;
}
