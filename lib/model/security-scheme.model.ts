import { OAuthFlows } from './oauth-flows.model';

export interface SecurityScheme {
  type: string;
  description: string;
  name: string;
  in: string;
  scheme: string;
  bearerFormat: string;
  flows: OAuthFlows;
  openIdConnectUrl: string;
}
