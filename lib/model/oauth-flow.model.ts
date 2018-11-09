export interface OAuthFlow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl: string;
  scopes: {
    [name: string]: string;
  };
}
