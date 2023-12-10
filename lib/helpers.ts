import { writeFile, rename } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SchemaManager, { Schema } from "@peleicht/tf2-schema";
import { ParsedSchema, Enum, NumEnum, ItemType } from "../types";
import { normalizeName } from "../Item.js";
import importJSON from "../types/importJSON.js";

const parsed_schema = importJSON("/data/parsed_schema.json") as ParsedSchema;
const parsed_schema_names = importJSON("/data/parsed_schema_names.json") as ParsedSchema;
const parsed_schema_norm_names = importJSON("/data/parsed_schema_norm_names.json") as ParsedSchema;
const promos = importJSON("/data/promos.json") as NumEnum;

let schema_listener_set = false;

export async function makeSchema(steam_api_key: string): Promise<Schema> {
	const schemaManager = new SchemaManager({ apiKey: steam_api_key, updateTime: -1 });

	if (!schema_listener_set) {
		schema_listener_set = true;
		schemaManager.on("schema", (schema: Schema) => {
			saveFile(schema, "schema", false);
		});
	}

	try {
		await schemaManager.init();
	} catch (err) {
		console.log("SchemaManager init failed: " + err);

		//use backup schema
		const schema = importJSON("/data/schema.json");
		schemaManager.setSchema(schema, false);
	}

	return schemaManager.schema!;
}

/**
 * Normalizes the names in the Schema, writes them to item.norm_item_name. Updated promos, then restarts bot if anything changed.
 */
export function parseSchema(schema: Schema): [ParsedSchema, ParsedSchema, ParsedSchema, NumEnum] {
	if (schema.raw.schema.items.length == Object.keys(parsed_schema).length)
		return [parsed_schema, parsed_schema_names, parsed_schema_norm_names, promos];

	const item_type_mapping: { [key: string]: string } = {
		melee: "weapon",
		primary: "weapon",
		secondary: "weapon",
		pda: "weapon",
		pda2: "weapon",
		building: "weapon",
		upgrade: "action",
		saxxy: "utility",
		class_token: "craft_item",
	};

	const new_parsed_schema: ParsedSchema = {};
	const new_parsed_schema_names: ParsedSchema = {};
	const new_parsed_schema_norm_names: ParsedSchema = {};

	for (let item of schema.raw.schema.items) {
		const parsed = {
			def_index: item.defindex,
			item_name: item.item_name.replace("\n", " "),
			proper_name: item.proper_name,
			type: (item_type_mapping[item.item_slot] || item.item_slot || item.item_class) as ItemType,
			norm_item_name: normalizeName(item.item_name),
			img: item.image_url_large,
		};
		new_parsed_schema[parsed.def_index] = parsed;
		if (!new_parsed_schema_names[parsed.item_name]) new_parsed_schema_names[parsed.item_name] = parsed;
		if (!new_parsed_schema_norm_names[parsed.norm_item_name]) new_parsed_schema_norm_names[parsed.norm_item_name] = parsed;
	}

	const new_promos = getPromos(new_parsed_schema);
	saveFile(new_promos, "promos");
	saveFile(new_parsed_schema, "parsed_schema", false);
	saveFile(new_parsed_schema_names, "parsed_schema_names", false);
	saveFile(new_parsed_schema_norm_names, "parsed_schema_norm_names", false);

	return [new_parsed_schema, parsed_schema_names, new_parsed_schema_norm_names, new_promos];
}

/**
 * Gets all Promo/Strange/Decorated Items that have multiple different def_index. Use via promos[def_index] || def_index. Watch out for bat promo :)
 */
export function getPromos(mod_schema: ParsedSchema): NumEnum {
	const doubles: { [key: number]: number } = {
		294: 160, //lugermorph (Vintage / Unique)
	};

	const found = [294];

	const def_indexes = Object.keys(mod_schema);
	for (let i = 0; i < def_indexes.length; i++) {
		const item0 = mod_schema[def_indexes[i]];

		if (ignore(item0.def_index, item0.norm_item_name)) continue;

		const promo_name = "promo " + item0.norm_item_name;
		const upgradeable_name = "upgradeable " + item0.norm_item_name;
		for (let j = i + 1; j < def_indexes.length; j++) {
			const item1 = mod_schema[def_indexes[j]];
			if (ignore(item1.def_index, item1.norm_item_name)) continue;

			if (item0.norm_item_name == item1.norm_item_name || promo_name == item1.norm_item_name || upgradeable_name == item1.norm_item_name) {
				doubles[item1.def_index] = item0.def_index;
				found.push(item1.def_index);
			}
		}
	}

	return doubles;

	function ignore(def_index: number, name: string) {
		return found.includes(def_index) || (def_index >= 8000 && def_index < 15000 && def_index != 9536) || name == "";
	}
}

/**
 * Gets all Unusual Effects and their corresponding IDs. Writes the results to EUnusualEffects.json.
 */
export function updateUnusuals(unus: any[]): Enum {
	const parsed_unus: Enum = { NoEffect: 0, 0: "NoEffect" };
	for (let i = 0; i < unus.length; i++) {
		const entry = unus[i];
		parsed_unus[entry.id] = entry.name;
		if (!parsed_unus[entry.name]) parsed_unus[entry.name] = entry.id;
	}

	saveFile(parsed_unus, "EUnusualEffects");
	return parsed_unus;
}

/**
 * Gets all Textures and their corresponding IDs. Writes the result to ETextures.json.
 * @returns An Object with name and id attributes
 */
export function updateTextures(schema_textures: Enum): Enum {
	const ids = Object.keys(schema_textures);
	const textures: Enum = { NoTexture: 0, 0: "NoTexture" };
	for (let id of ids) {
		textures[id] = schema_textures[id];
		textures[schema_textures[id]] = Number(id);
	}

	saveFile(textures, "ETextures");
	return textures;
}

/**
 * Safely writes files to /data (or /enums if target starts with E).
 * @param data
 * @param target File Name before the .
 * @param fancy Makes the file more readable, but bigger. Default true.
 * @returns success
 */
export async function saveFile(data: string | any, target: string, fancy = true): Promise<boolean> {
	if (!(data instanceof String)) {
		if (fancy) data = JSON.stringify(data, null, 4);
		else data = JSON.stringify(data);
	}

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const root_dirname = __dirname.slice(0, __dirname.length - 9);

	const target_dir = target.startsWith("E") ? "/enums/" : "/data/";
	const path = root_dirname + target_dir + target + ".json.temp";

	return new Promise(res => {
		writeFile(path, data, err => {
			if (err) {
				console.log("Error writing File (" + path.substring(0, path.length - 5) + "): " + err);
				res(false);
			} else {
				rename(path, path.substring(0, path.length - 5), () => {}); //rename is atomic operation, writing is not and can cause corruption if interrupted
				res(true);
			}
		});
	});
}
