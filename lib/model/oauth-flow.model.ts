export class OAuthFlow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl: string;
  scopes: Map<string, string>;
}
