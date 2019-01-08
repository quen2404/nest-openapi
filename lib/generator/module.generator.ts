import * as camelcase from 'camelcase';
import TypeScriptAst from 'ts-simple-ast';
import { GeneratorOptions } from './generator-options.interface';
import { capitalize, camelToKebab, removeEnd, relativizeImport } from '../utils';
import { ControllerInterface } from './controller.interface';

export class ModuleGenerator {
  private tsAstHelper = new TypeScriptAst();

  public constructor(private options: GeneratorOptions) {}

  public async generate(controllers: ControllerInterface[]) {
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
    moduleFile.addImportDeclarations(
      controllers.map(controller => ({
        namedImports: [controller.className],
        moduleSpecifier: relativizeImport(this.options.outputPath, controller.path),
      })),
    );
    const kebabModuleName = camelToKebab(removeEnd(this.implementationModuleName, 'Module'));
    moduleFile.addImportDeclaration({
      namedImports: [this.implementationModuleName],
      moduleSpecifier: `../${kebabModuleName}/${kebabModuleName}.module`,
    });
    moduleFile.addClass({
      name: `${capitalize(camelName)}Module`,
      isExported: true,
      decorators: [
        {
          name: 'Module',
          arguments: [this.getModuleDecoratorBody(controllers)],
        },
      ],
    });
    return await moduleFile.organizeImports().save();
  }

  public getModuleDecoratorBody(controllers: ControllerInterface[]) {
    const controllersValue = controllers.map(controller => controller.className).join(',');
    return `{
      imports: [${this.implementationModuleName}],
      controllers: [${controllersValue}],
      providers: [],
      }`;
  }

  public get implementationModuleName() {
    return capitalize(camelcase(`${this.options.moduleName}ImplModule`));
  }
}
