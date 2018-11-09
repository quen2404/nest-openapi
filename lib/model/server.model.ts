import { ServerVariable } from './server-variable.model';
export interface Server {
  url: string;
  description: string;
  variables: {
    [key: string]: ServerVariable;
  };
}
