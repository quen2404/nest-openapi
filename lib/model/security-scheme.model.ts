import { OAuthFlows } from './oauth-flows.model';
import { SpecificationExtensions } from './extensions.model';

export class SecurityScheme extends SpecificationExtensions {
  type: string;
  description: string;
  name: string;
  in: string;
  scheme: string;
  bearerFormat: string;
  flows: OAuthFlows;
  openIdConnectUrl: string;
}
