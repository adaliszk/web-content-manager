import {
    HTMLFragment,
    type JSXOutput,
    type PropsOf,
    component$,
    useSignal,
    useStyles$,
    useVisibleTask$,
} from "@builder.io/qwik";
import { JSDOM } from "jsdom";
import { twMerge } from "tailwind-merge";
import { ulid } from "ulid";
import type { IconName } from "~/app/types.ts";
import { Icon, Input } from "~/components.ts";

export type MarkdownEditorBlockElement =
    | "jsx"
    | `h${1 | 2 | 3 | 4 | 5 | 6}`
    | "div"
    | "p"
    | "a"
    | "blockquote"
    | "pre"
    | "table"
    | "code"
    | "picture"
    | "img"
    | "svg"
    | "ul"
    | "ol";

export type MarkdownEditorBlock = {
    element: MarkdownEditorBlockElement;
    props: Record<string, unknown>;
    content: string;
    id: string;
};

const iconSize = 18;
const markdownIconMap: Record<MarkdownEditorBlockElement, JSXOutput | string> = {
    h1: <Icon name={"format-header1"} size={iconSize + 8} class={"mt-0.5"} />,
    h2: <Icon name={"format-header2"} size={iconSize} class={"mt-1"} />,
    h3: <Icon name={"format-header3"} size={iconSize} class={"mt-0.5"} />,
    h4: <Icon name={"format-header4"} size={iconSize} class={"mt-0.5"} />,
    h5: <Icon name={"format-header5"} size={iconSize} class={""} />,
    h6: <Icon name={"format-header6"} size={iconSize} class={""} />,
    p: <Icon name={"format-pilcrow"} size={iconSize} />,
    blockquote: <Icon name={"format-quote-open"} size={iconSize} />,
    pre: <Icon name={"format-quote-open"} size={iconSize} />,
    code: <Icon name={"format-code"} size={iconSize} />,
    picture: <Icon name={"format-image-transparent"} size={iconSize} />,
    img: <Icon name={"format-image-transparent"} size={iconSize} />,
    svg: <Icon name={"format-image-transparent"} size={iconSize} />,
    ul: <Icon name={"minus"} size={iconSize} class={"mt-0.5"} />,
    ol: <Icon name={"format-code"} size={iconSize} />,
    table: <Icon name={"format-table"} size={iconSize} />,
    div: <Icon name={"format-code"} size={iconSize} />,
    a: <Icon name={"link"} size={iconSize} />,
    jsx: "jsx",
};

const markdownStyleMap: Record<MarkdownEditorBlockElement, string> = {
    h1: "text-3xl",
    h2: "text-2xl",
    h3: "text-xl",
    h4: "text-lg",
    h5: "text-md",
    h6: "text-base",
    p: "text-base",
    blockquote: "text-md",
    code: "text-md",
    picture: "text-md",
    img: "text-md",
    svg: "text-md",
    ul: "text-md",
    ol: "text-md",
    table: "text-md",
    jsx: "text-md",
    div: "text-md",
    a: "text-md",
    pre: "text-md",
};

function parseRenderedMarkdown(content: string): MarkdownEditorBlock[] {
    const dom = new JSDOM(content);
    const elements = dom.window.document.querySelector("body")?.children ?? [];
    const blocks = mapElementsToContentBlocks(Array.from(elements));
    console.log(blocks);
    return blocks;
}

function mapElementsToContentBlocks(
    elements: Element[],
    blockType?: MarkdownEditorBlockElement,
): MarkdownEditorBlock[] {
    return Array.from(elements).flatMap((block) => {
        const id = `block-${ulid()}`;
        const tagName = block.tagName.toLowerCase() as MarkdownEditorBlockElement;
        const content = block.outerHTML;

        if (tagName === "ul" || tagName === "ol")
            return mapElementsToContentBlocks(Array.from(block.children), tagName);

        return {
            element: blockType ?? tagName,
            props: Object.fromEntries(
                Array.from(block.attributes).map((attr) => [attr.name, attr.value]),
            ),
            content,
            id,
        };
    });
}

export const MarkdownEditorDropZone = component$<PropsOf<"div">>(
    ({ class: classList, ...props }) => {
        const dropzoneRef = useSignal<HTMLElement | undefined>(undefined);
        useStyles$(
            ".dragzone .dropzone { display: none; } " +
                ".dragzone.dragging .dropzone { display: block; }  " +
                ".dragzone.dragging .dropzone.drag-hover { opacity: 1; } ",
        );
        useVisibleTask$(({ cleanup }) => {
            const onDragOver = (ev: DragEvent) => {
                const target = ev.target as HTMLDivElement;
                if (!ev.dataTransfer || !target) return;
                const availableDropzones = Array.from<HTMLElement>(
                    target.parentElement?.parentElement?.querySelectorAll(".dropzone") ?? [],
                );
                for (const el of availableDropzones) {
                    el.classList.remove("drag-hover");
                }
                target.classList.add("drag-hover");
                ev.dataTransfer.dropEffect = "move";
                ev.preventDefault();
            };
            const onDrop = (ev: DragEvent) => {
                const target = ev.target as HTMLDivElement;
                if (!ev.dataTransfer) return;
                const blockId = ev.dataTransfer.getData("item/id");
                const block = document.getElementById(blockId);
                console.log("::onDrop", { target, block, blockId });
                if (block) target.parentElement?.insertAdjacentElement("beforebegin", block);
                ev.preventDefault();
            };

            dropzoneRef.value?.addEventListener("dragover", onDragOver);
            dropzoneRef.value?.addEventListener("drop", onDrop);

            cleanup(() => {
                dropzoneRef.value?.removeEventListener("dragover", onDragOver);
                dropzoneRef.value?.removeEventListener("drop", onDrop);
            });
        });

        return (
            <div
                {...props}
                class={twMerge(
                    "dropzone absolute z-20 inset-0 -translate-y-1/2 -mt-2",
                    "after:absolute after:top-1/2 after:left-6 after:right-3",
                    "after:border-2 after:border-accent",
                    "transition-opacity duration-150 opacity-0",
                    classList?.toString(),
                )}
                ref={dropzoneRef}
            />
        );
    },
);

export const MarkdownEditorContentBlock = component$<MarkdownEditorBlock>((item) => {
    const draggableRef = useSignal<HTMLElement>();
    useVisibleTask$(({ cleanup }) => {
        const onDragStart = (ev: DragEvent) => {
            if (!ev.dataTransfer) return;
            console.log("::onDragStart$", { ev });
            ev.dataTransfer.setData("item/id", item.id);
            ev.dataTransfer.effectAllowed = "move";
            draggableRef.value?.parentElement?.classList.add("dragging");
            draggableRef.value?.classList.add("dragging");
        };
        const onDragEnd = (ev: DragEvent) => {
            if (!ev.dataTransfer) return;
            console.log("::onDragEnd$", { ev });
            ev.dataTransfer.clearData("item/id");
            draggableRef.value?.parentElement?.classList.remove("dragging");
            draggableRef.value?.classList.remove("dragging");
        };

        draggableRef.value?.addEventListener("dragstart", onDragStart);
        draggableRef.value?.addEventListener("dragend", onDragEnd);

        cleanup(() => {
            draggableRef.value?.removeEventListener("dragstart", onDragStart);
            draggableRef.value?.removeEventListener("dragend", onDragEnd);
        });
    });

    type ActionProps = {
        label: string;
        shortcut?: string;
        icon: IconName;
    };

    const Action = component$<ActionProps>(({ label, icon, shortcut }) => (
        <li class={"h-10"}>
            <button type={"button"} class={"btn-ghost btn-sm flex flex-row items-center gap-2"}>
                <Icon name={icon} size={iconSize} />
                <span class={"inline-block"}>{label}</span>
                <div class={"flex-grow"} />
                {shortcut && <kbd class={"text-xs capitalize opacity-50"}>{shortcut}</kbd>}
            </button>
        </li>
    ));

    useStyles$(".content-block:read-write:focus { outline: none; }");
    useStyles$(".content-block li { list-style: none; }");
    return (
        <>
            <section
                id={item.id}
                class={twMerge(
                    "group mb-0.5 relative",
                    "flex flex-row items-stretch content-stretch justify-stretch",
                    "transition-colors duration-200",
                    "rounded-md bg-base-100 hover:bg-base-200 focus-within:bg-base-200",
                    "outline-2 outline-transparent focus-within:outline-base-300",
                    "has-[&_.content-block:read-write:focus]:outline-base-300",
                )}
                ref={draggableRef}
                draggable={true}>
                <MarkdownEditorDropZone />
                <aside
                    class={twMerge(
                        "dropdown dropdown-left rounded-l-md w-12",
                        "transition-all duration-200",
                        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                        "self-stretch pr-2 relative -top-0.5",
                        markdownStyleMap[item.element],
                        item.element === "ul" &&
                            "opacity-100 translate-x-8 group-focus-within:translate-x-0",
                    )}>
                    <button
                        tabIndex={-1} // Prevents the button from being focusable as this is only for mouse interaction
                        type={"button"}
                        class={twMerge(
                            "pt-2 pr-1 w-full relative top-0.5",
                            "flex flex-row justify-end text-right text-nowrap",
                            "h-full text-right rounded-l-md",
                            "transition-colors bg-transparent hover:bg-base-300",
                        )}>
                        {markdownIconMap[item.element]}
                    </button>
                    <ul
                        class={twMerge(
                            "menu z-10 p-2 w-72 text-left",
                            "dropdown-content shadow bg-base-300 rounded-md",
                        )}>
                        <li class={"h-10"}>
                            <Input placeholder="Search for action..." class={"input-sm"} />
                        </li>
                        <Action label="Comment" icon="comment-text" shortcut="Ctrl+Shift+M" />
                        <Action label="Delete" icon="trash" shortcut="Delete" />
                        <Action label="Duplicate" icon="duplicate" shortcut="Ctrl+D" />
                    </ul>
                </aside>
                <div
                    class={twMerge(
                        "content-block flex-1 py-2 flex flex-col justify-center",
                        "border-transparent focus:border-transparent focus:ring-0",
                        "transition-all duration-200",
                        markdownStyleMap[item.element],
                        item.element === "ul" && "translate-x-8 group-focus-within:translate-x-0",
                    )}
                    contentEditable={"true"}
                    onKeyPress$={(ev) => {
                        console.log("::onKeyPress$", { ev, key: String(ev.key) });
                    }}
                    // biome-ignore lint/a11y/noNoninteractiveTabindex: With contentEditable, the component is interactive
                    tabIndex={0}>
                    {/* biome-ignore lint/security/noDangerouslySetInnerHtml: we are rendering HTML here */}
                    <HTMLFragment dangerouslySetInnerHTML={item.content} />
                </div>
                <aside
                    class={twMerge(
                        "py-2 pl-1 w-8",
                        "flex flex-col items-center content-center text-center justify-between",
                        "rounded-r-md cursor-grab",
                        "transition-all duration-200",
                        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                        "bg-base-200 hover:bg-base-300",
                    )}>
                    <Icon name={"chevron-up"} size={iconSize} class={"-ml-1.5 -mb-2"} />
                    <Icon name={"chevron-down"} size={iconSize} class={"-ml-1.5 -mt-2"} />
                </aside>
            </section>
        </>
    );
});

export type MarkdownEditorProps = {
    content: string;
};

export const MarkdownEditor = component$<MarkdownEditorProps>(({ content }) => {
    const blocks = parseRenderedMarkdown(content);
    return (
        <>
            <article class="dragzone p-4 w-full h-full max-w-screen-lg mx-auto overflow-visible">
                {blocks.map((item) => (
                    <MarkdownEditorContentBlock key={item.id} {...item} />
                ))}

                <section id={"block-end"}>
                    <MarkdownEditorDropZone />
                </section>
            </article>
            <section class={"h-24"}>&nbsp;</section>
        </>
    );
});
