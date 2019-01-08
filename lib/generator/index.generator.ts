import { Project, ExportDeclarationStructure } from 'ts-simple-ast';
import { GeneratorOptions } from './generator-options.interface';
import { relativizeImport } from '../utils';

export class IndexGenerator {
  public constructor(private options: GeneratorOptions) {}

  public async generate() {
    const project = new Project();
    project.addExistingSourceFiles(`${this.options.outputPath}/**/*.ts`);
    console.log('test', `${this.options.outputPath}/**/*.ts`);
    const exports: ExportDeclarationStructure[] = [];
    project
      .getSourceFiles()
      .map(sourceFile => {
        const importPath = relativizeImport(this.options.outputPath, sourceFile.getFilePath());
        if (importPath != './index') {
          const names: string[] = [];
          sourceFile
            .getExportedDeclarations()
            .map(exp => {
              if (instanceofNameable(exp)) {
                return exp.getName();
              }
              return null;
            })
            .filter(name => name != null)
            .forEach(name => names.push(name));
          return {
            namedExports: names,
            moduleSpecifier: importPath,
          };
        }
        return null;
      })
      .filter(exp => exp != null)
      .forEach((exp: ExportDeclarationStructure) => exports.push(exp));

    const indexFile = project.createSourceFile(`${this.options.outputPath}/index.ts`, '', {
      overwrite: true,
    });
    indexFile.addExportDeclarations(exports);
    return await indexFile.save();
  }
}

interface Nameable {
  getName(): string;
}

function instanceofNameable(object: any): object is Nameable {
  return 'getName' in object;
}
