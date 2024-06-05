// noinspection JSUnusedGlobalSymbols

import "@adaliszk/std/prelude";

declare module "*.astro" {
    export default (props?: object) => string;
}

declare global {
    interface Window {
        FederatedCredential?: boolean;
        PasswordCredential?: boolean;
    }
}

interface ImportMetaEnv {
    readonly SECRET_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
