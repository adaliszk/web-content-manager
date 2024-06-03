type Pattern = string;
type RootPath = string;

/**
 * Simple abstraction for RegExp patterns so that the plugin can refer to it easier.
 */
export type RegExpression = {
    pattern: Pattern;
    regexp: RegExp;
};

/**
 * RegExp literal tag function, inspired by Python
 *
 * ```typescript
 * import { r } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`^something$`;
 * ```
 */
export function r(strings: TemplateStringsArray, ...values: string[]): RegExpression {
    const pattern = strings[0] + values.map((v, i) => v + strings[i + 1]).join("");
    return {
        // With the root() group there will be a double-slash in the pattern that is useful to find that group
        regexp: RegExp(pattern.replace("//", "/")),
        pattern,
    };
}

/**
 * RegExp directive for specifying the root path from which the content scanning can start
 * This is required at the start of each definition pattern!
 *
 * ```typescript
 * import { r, root } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${root(r`\\d+`)}/[\\w-]+.mdx?`;
 * ```
 */
export function root(path: string): RootPath {
    return `^${path}/`;
}

/**
 * RegExp directive to specify an any matching
 *
 * ```typescript
 * import { r, any } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${any()}.mdx?`;
 * ```
 */
export function any(): `.*` {
    return ".*";
}

/**
 * RegExp group for any additional data present in the path
 *
 * ```typescript
 * import { r, group } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${group("custom", r`\\w{2}`)}/[\\w-]+.mdx?`;
 * ```
 */
export function group<G extends string>(name: G, regex: RegExpression): `(?<${G}>${Pattern})` {
    return `(?<${name}>${regex.pattern})`;
}

/**
 * RegExp group for specifying the contents of the lang property
 *
 * ```typescript
 * import { r, lang } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${lang(r`\\w{2}`)}/[\\w-]+.mdx?`;
 * ```
 */
export function lang(regex: RegExpression): `(?<langCode>${Pattern})` {
    return group("langCode", regex);
}

/**
 * RegExp group for specifying the default sorting index by a path component
 *
 * ```typescript
 * import { r, index } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${index(r`\\d+`)}-[\\w-]+.mdx?`;
 * ```
 */
export function index(regex: RegExpression): `(?<sortIndex>${Pattern})` {
    return group("sortIndex", regex);
}

/**
 * RegExp group for specifying the display name of the content files
 *
 * ```typescript
 * import { r, name } from "@adaliszk/web-content-manager";
 *
 * const pattern = r`${name(r`[\w-]+`)}\.mdx?`;
 * ```
 */
export function name(regex: RegExpression): `(?<name>${Pattern})` {
    return group("name", regex);
}
