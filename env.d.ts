// env.d.ts
// This is kind of hack to make the IDE stop complaining about:
// TS2339: Property NEXT_PUBLIC_APP_URL does not exist on type Readonly<{}>.

// Regarding the TS2339 error comment previously in this file:
// If you are accessing environment variables directly via `process.env.YOUR_VAR`
// (e.g., `process.env.NEXT_PUBLIC_APP_URL`) and TypeScript complains,
// it's because the global `process.env` type is not aware of these variables by default.
//
// The **recommended approach** is to always use the typed `env` object
// imported from '@/env.mjs':
//   import { env } from '@/env.mjs';
//   console.log(env.NEXT_PUBLIC_APP_URL);
// This leverages the validation and type safety from `@t3-oss/env-nextjs`.
//
// If direct access to `process.env` is absolutely unavoidable for specific variables,
// you can augment the NodeJS.ProcessEnv interface. Uncomment and modify the
// block below as needed. However, prefer using the typed `env` object.
/*
namespace NodeJS {
  interface ProcessEnv {
    // Add only variables here that you MUST access via global `process.env`
    // and are not intended to be accessed via the typed `env` object.
    // Example:
    //   NEXT_PUBLIC_APP_URL?: string;
    //   SOME_OTHER_GLOBAL_VAR?: string;
  }
}
*/

// The manual interface 'Env', the module declaration for '@t3-oss/env-nextjs',
// and the module declaration for '@/env.mjs' have been removed.
// TypeScript, with "allowJs": true, should infer types from 'env.mjs'
// and the '@t3-oss/env-nextjs' library directly.
// Ensure that when you `import { env } from '@/env.mjs'`, the `env` object
// is correctly typed in your IDE and by the TypeScript compiler.
