import { HTMLFragment, Resource, component$, useResource$ } from "@builder.io/qwik";
import { Icon as AstroIcon } from "astro-icon/components";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

const icons = [
    "pencil",
    "trash",
    "home",
    "database",
    "file",
    "file-edit",
    "file-lock",
    "file-lock-open",
    "file-compare",
    "file-check",
    "file-clock",
    "file-plus",
    "file-redirect",
    "file-eye-outline",
    "folder",
    "folder-open",
    "folder-edit",
    "folder-home",
    "folder-lock",
    "folder-lockOpen",
    "folder-plus",
    "settings",
] as const;

export type IconName = (typeof icons)[number];
type IconProps = {
    name: IconName;
    "is:inline"?: boolean;
    title?: string;
    size?: number;
    height?: number;
    width?: number;
};

const container = await AstroContainer.create();
export const Icon = component$<IconProps>((props) => (
    <Resource
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for the conversion
        onResolved={(rendered) => <HTMLFragment dangerouslySetInnerHTML={rendered} />}
        value={useResource$(async () => {
            return container.renderToString(AstroIcon, { props });
        })}
    />
));
