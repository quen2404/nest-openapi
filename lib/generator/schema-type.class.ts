import { ImportDeclarationStructure } from 'ts-simple-ast';

export enum BundleType {
  PROMISE = 'Promise',
  Observable = 'Observable',
}

export class SchemaType {
  constructor(
    public name: string,
    public module?: string,
    public isArray?: boolean,
    public bundle: BundleType = BundleType.PROMISE,
  ) {
    if (isArray == null) {
      this.isArray = false;
    }
  }

  get type(): string {
    return this.name + (this.isArray ? '[]' : '');
  }

  get file(): string {
    return `${this.module}.ts`;
  }

  get promisifyName(): string {
    return `${this.bundle}<${this.name}>`;
  }

  get needImport(): boolean {
    return this.module != null;
  }

  getImportDeclaration(): ImportDeclarationStructure {
    if (!this.needImport) {
      return null;
    }
    return {
      moduleSpecifier: `../${this.module}`,
      namedImports: [this.name],
    };
  }
}

export const TYPE_ANY = new SchemaType('any');
export const TYPE_NEVER = new SchemaType('never');
export const TYPE_VOID = new SchemaType('void');
