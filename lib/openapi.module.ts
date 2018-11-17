import { OnModuleInit, DynamicModule, Provider } from '@nestjs/common';
import { OpenAPIModuleOptions, OpenAPIModuleAsyncOptions, OpenAPIOptionsFactory } from './interfaces';
import { OPENAPI_MODULE_OPTIONS, OPENAPI_MODULE_ID } from './openapi.constants';
import { generateString } from './utils';

export class OpenAPIModule implements OnModuleInit {
  constructor() {}

  onModuleInit() {
    throw new Error('Method not implemented.');
  }

  static forRoot(options: OpenAPIModuleOptions = {}): DynamicModule {
    return {
      module: OpenAPIModule,
      providers: [
        {
          provide: OPENAPI_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: OpenAPIModuleAsyncOptions): DynamicModule {
    return {
      module: OpenAPIModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: OPENAPI_MODULE_ID,
          useValue: generateString(),
        },
      ],
    };
  }

  private static createAsyncProviders(options: OpenAPIModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: OpenAPIModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OPENAPI_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: OPENAPI_MODULE_OPTIONS,
      useFactory: async (optionsFactory: OpenAPIOptionsFactory) => await optionsFactory.createOpenAPIOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
