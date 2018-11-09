import { Response } from './response.model';
export interface Responses {
  default: Response;
  [code: string]: Response;
}
