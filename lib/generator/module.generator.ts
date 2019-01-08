import * as camelcase from 'camelcase';
import TypeScriptAst from 'ts-simple-ast';
import { GeneratorOptions } from './generator-options.interface';
import { capitalize, camelToKebab, removeEnd } from '../utils';

export class ModuleGenerator {
  private tsAstHelper = new TypeScriptAst();

  public constructor(private options: GeneratorOptions) {}

  public async generate() {
    const camelName = removeEnd(camelcase(this.options.moduleName), 'Module');
    const moduleFile = this.tsAstHelper.createSourceFile(
      `${this.options.outputPath}/${camelToKebab(camelName)}.module.ts`,
      '',
      {
        overwrite: true,
      },
    );
    moduleFile.addImportDeclaration({
      namedImports: ['Module'],
      moduleSpecifier: '@nestjs/common',
    });
    moduleFile.addClass({
      name: `${capitalize(camelName)}Module`,
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
    return await moduleFile.organizeImports().save();
  }
}