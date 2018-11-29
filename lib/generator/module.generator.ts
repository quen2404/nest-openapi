import TypeScriptAst, { Scope, SourceFile } from 'ts-simple-ast';

export class ModuleGenerator {
  private tsAstHelper = new TypeScriptAst();
  constructor(private outputPath: string) {}

  public generate() {
    this.tsAstHelper = new TypeScriptAst();
    const moduleFile = this.tsAstHelper.createSourceFile(`${this.outputPath}/test.module.ts`, '', {
      overwrite: true,
    });
    moduleFile.addImportDeclaration({
      namedImports: ['Module'],
      moduleSpecifier: '@nestjs/common',
    });
    moduleFile.addClass({
      name: 'TestModule',
      isExported: true,
      decorators: [
        {
          name: 'Module',
          arguments: [
            `{
imports: [],
controllers: [],
providers: [],
}`,
          ],
        },
      ],
    });
    moduleFile.organizeImports().saveSync();
  }
}
