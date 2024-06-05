import { HTMLFragment, Resource, component$, useResource$ } from "@builder.io/qwik";
import { Icon as AstroIcon } from "astro-icon/components";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { IconName } from "~/app/types.ts";

export type IconProps = {
    name: IconName;
    "is:inline"?: boolean;
    class?: string;
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
