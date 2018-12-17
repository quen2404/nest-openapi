import { SchemaType } from './schema-type.class';
import { ImportDeclarationStructure } from 'ts-simple-ast';

export enum BundleType {
  NONE = '',
  PROMISE = 'Promise',
  OBSERVABLE = 'Observable',
}

export class ResponseType {
  constructor(
    public schema: SchemaType,
    public responseContainer: boolean = false,
    public bundleType: BundleType = BundleType.PROMISE,
  ) {}

  get type(): string {
    const type = this.responseContainer ? `Response<${this.schema.type}>` : this.schema.type;
    switch (this.bundleType) {
      case BundleType.NONE:
        return type;
      default:
        return `${this.bundleType}<${type}>`;
    }
  }

  getImportDeclarations(): ImportDeclarationStructure[] {
    const declarations: ImportDeclarationStructure[] = [this.schema.getImportDeclaration()];
    if (this.responseContainer) {
      declarations.push({
        moduleSpecifier: `nest-openapi`,
        namedImports: ['Response'],
      });
    }
    if (this.bundleType === BundleType.OBSERVABLE) {
      declarations.push({
        moduleSpecifier: 'rxjs',
        namedImports: ['Observable'],
      });
    }
    return declarations;
  }
}
