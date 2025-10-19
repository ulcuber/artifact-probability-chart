import { ref } from 'vue';
import type {
  App, InjectionKey, ComponentPublicInstance, Ref,
} from 'vue';

interface ErrorWrapper {
  error: Error | null | unknown
  message: string
  context: {
    from: string
    source?: string | null
    stack?: string
  }
}

interface Errors {
  errors: Ref<ErrorWrapper[]>
  clear: () => void
}

export const errorsKey = Symbol('errors') as InjectionKey<Errors>;

export default {
  install(app: App) {
    const errors = ref<ErrorWrapper[]>([]);

    function onWindowError(
      message: Event | string,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error,
    ) {
      console.error(message, source, lineno, colno, error);
      const errorName = error && typeof error === 'object'
        && 'name' in error && typeof error.name === 'string'
        ? error.name
        : '';
      errors.value.push({
        error,
        message: `${errorName}: ${message}`,
        context: {
          from: 'window.onerror',
          source,
        },
      });
    }

    // eslint-disable-next-line no-param-reassign
    app.config.errorHandler = (
      error: unknown,
      vm: ComponentPublicInstance | null,
      info: string,
    ) => {
      console.error('app.config.errorHandler', error);
      // eslint-disable-next-line no-underscore-dangle
      const name = (vm && vm.$options) ? vm.$options.__name : 'component';
      // eslint-disable-next-line no-underscore-dangle
      const source = (vm && vm.$options) ? vm.$options.__file : null;
      const errorName = error && typeof error === 'object'
        && 'name' in error && typeof error.name === 'string'
        ? error.name
        : '';
      const errorMessage = error && typeof error === 'object'
        && 'message' in error && typeof error.message === 'string'
        ? error.message
        : '';
      errors.value.push({
        error,
        message: `${name}@${info}: ${errorName}: ${errorMessage}`,
        context: {
          from: 'app.config.errorHandler',
          source,
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
    };

    if (window) {
      window.onerror = onWindowError as OnErrorEventHandler;
    }

    app.provide(errorsKey, {
      errors,
      clear() {
        errors.value = [];
      },
    });
  },
};
