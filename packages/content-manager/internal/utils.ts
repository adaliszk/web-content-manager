import { createHash } from "node:crypto";
import { type ULIDLike, createULIDLike } from "@adaliszk/std";

/**
 * Parses an MD5 hash out of the provided input
 */
export const md5 = (str: string): string => createHash("md5").update(str).digest("hex").toString();

/**
 * Parses an ULID-like string from the provided input
 * Note: The lexical nature of the format may be lost if a regular string is provided!
 *
 * @trows TypeError when the generated md5 is mail-formatted that should not occur normally
 */
export const uid = (md5: string): ULIDLike => createULIDLike(md5.slice(-26)).unwrap();
