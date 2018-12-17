import { ImportDeclarationStructure } from 'ts-simple-ast';

export enum BundleType {
  NONE = '',
  PROMISE = 'Promise',
  OBSERVABLE = 'Observable',
}

export class SchemaType {
  constructor(
    public name: string,
    public module?: string,
    public isArray?: boolean,
    public asResponse: boolean = false,
    public bundle: BundleType = BundleType.PROMISE,
  ) {
    if (isArray == null) {
      this.isArray = false;
    }
  }

  get type(): string {
    return this.asResponse ? `Response<${this.objectType}>` : this.objectType;
  }
  get asBundle(): string {
    switch (this.bundle) {
      case BundleType.NONE:
        return this.type;
      default:
        return `${this.bundle}<${this.type}>`;
    }
  }

  get objectType(): string {
    return this.name + (this.isArray ? '[]' : '');
  }

  get file(): string {
    return `${this.module}.ts`;
  }

  get needImport(): boolean {
    return this.module != null;
  }

  getImportDeclarations(): ImportDeclarationStructure[] {
    if (!this.needImport) {
      return null;
    }
    const declarations: ImportDeclarationStructure[] = [
      {
        moduleSpecifier: `../${this.module}`,
        namedImports: [this.name],
      },
    ];
    if (this.asResponse) {
      declarations.push({
        moduleSpecifier: `nest-openapi`,
        namedImports: ['Response'],
      });
    }
    if (this.bundle === BundleType.OBSERVABLE) {
      declarations.push({
        moduleSpecifier: 'rxjs',
        namedImports: ['Observable'],
      });
    }
    return declarations;
  }
}

export const TYPE_ANY = new SchemaType('any');
export const TYPE_NEVER = new SchemaType('never');
export const TYPE_VOID = new SchemaType('void');
