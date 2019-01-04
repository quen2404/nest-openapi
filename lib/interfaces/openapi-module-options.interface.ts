import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface OpenAPIModuleOptions {
  sourcePath: string;
  output: {
    path: string;
    moduleName: string;
  };
  controller?: {
    responseBundle: 'Promise' | 'Observable';
  };
}

export interface OpenAPIModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OpenAPIOptionsFactory>;
  useClass?: Type<OpenAPIOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OpenAPIModuleOptions> | OpenAPIModuleOptions;
  inject?: any[];
}

export interface OpenAPIOptionsFactory {
  createOpenAPIOptions(): Promise<OpenAPIModuleOptions> | OpenAPIModuleOptions;
}
