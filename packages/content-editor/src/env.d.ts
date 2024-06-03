// noinspection JSUnusedGlobalSymbols

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
