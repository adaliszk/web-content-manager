import { type UserConfig, webConfig } from "@adaliszk/web-compiler";

export default webConfig({
    https: true,
    resolve: {
        // the default behavior, but make sure this is not true as it is handled by plugin
        preserveSymlinks: false,
    },
}) as UserConfig;
