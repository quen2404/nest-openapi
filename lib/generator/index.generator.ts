import { Project, ExportDeclarationStructure } from 'ts-simple-ast';
import { GeneratorOptions } from './generator-options.interface';
import * as readdir from 'recursive-readdir';
import * as fs from 'fs';
import * as path from 'path';
import { removeEnd } from '../utils';
import { map } from 'rxjs/operators';

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
        const importPath = removeEnd(path.relative(this.options.outputPath, sourceFile.getFilePath()), '.ts');
        if (importPath != 'index') {
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
            moduleSpecifier: `./${importPath}`,
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
    /*
    const files: string[] = await readdir(this.options.outputPath, [
      (file: string, stats: fs.Stats): boolean => {
        console.log('filtering file', file);
        if (!file.endsWith('.ts')) {
          return !stats.isDirectory();
        }
        return false;
      },
    ]);
    files
      .map(file => {
        console.log('processing file:', file);
        const sourceFile = this.tsAstHelper.getSourceFile(file);
        return {
          path: removeEnd(path.relative(this.options.outputPath, file), '.ts'),
          exports: sourceFile.getExportDeclarations(),
        };
      })
      .filter(file => file.path !== 'index')
      .forEach(file => {
        console.log('file:', file);
        try {
          indexFile;
          indexFile.addExportDeclarations(file.exports.map(namedExport => namedExport.getStructure()));
        } catch (error) {
          console.error(error);
        }
      });*/
    return await indexFile.save();
  }
}

interface Nameable {
  getName(): string;
}

function instanceofNameable(object: any): object is Nameable {
  return 'getName' in object;
}
