import { FileDataProvider } from "~/app/data/FileDataProvider.js";
import { pages } from "~content/collections.ts";

export * from "../utils.ts";

export const AppData = new FileDataProvider([pages], "content");
