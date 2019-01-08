import * as path from 'path';
import { removeEnd } from '../utils';

export function relativizeImport(from: string, importPath: string) {
  return './' + removeTsExtension(path.relative(from, importPath));
}

export function removeTsExtension(path: string) {
  return removeEnd(path, '.ts');
}
