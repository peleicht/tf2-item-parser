import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cache = {} as any;

/**
 * Imports a json file from /data
 * @param file currently either "/data/parsed_schema.json" or "/data/promos.json" or "/enums/x"
 */
export default function importJSON(file: string) {
	if (cache[file]) return cache[file];
	const data = require("../.." + file);
	cache[file] = data;
	return data;
}
