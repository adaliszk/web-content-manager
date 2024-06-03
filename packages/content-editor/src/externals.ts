import type { HTMLAttributes } from "astro/types";

import { AstroFont as AstroFontImpl } from "astro-font";
// TODO: Open a PR to export the props in the main exports, and fix the /utils exports
// import type { Props as AstroFontProps } from "astro-font/utils";

// TODO: Open a PR to export the props in the main exports
import { Icon as IconImpl } from "astro-icon/components";

// biome-ignore lint/suspicious/noExplicitAny: We want to ignore property types for Astro files by default
type AstroComponent<PROPS = any> = (_props: PROPS) => string;

export const AstroFont = AstroFontImpl as AstroComponent;

type IconProps = HTMLAttributes<"svg"> & {
    name: string;
    "is:inline"?: boolean;
    title?: string;
    size?: number;
    width?: number;
    height?: number;
};

export const Icon = IconImpl as AstroComponent<IconProps>;
