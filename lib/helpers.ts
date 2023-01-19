import { writeFile, rename } from "fs";
import SchemaManager from "tf2-schema";

import importJSON from "../types/importJSON.js";
import { ParsedSchema, Enum, NumEnum } from "../types";
import Item from "../BaseItem.js";

const parsed_schema = importJSON("/data/parsed_schema.json") as ParsedSchema[];
const promos = importJSON("/data/promos.json") as NumEnum;

export async function makeSchema(steam_api_key: string) {
	return new Promise((res, rej) => {
		const schemaManager = new SchemaManager({ apiKey: steam_api_key, updateTime: -1 });
		schemaManager.init(async (err: any) => {
			if (err) {
				rej("SchemaManager init failed: " + err);
			} else {
				res(schemaManager.schema);
			}
		});
	});
}

/**
 * Normalizes the names in the Schema, writes them to item.norm_item_name. Updated promos, then restarts bot if anything changed.
 */
export function parseSchema(schema: any): [ParsedSchema[], NumEnum] {
	if (schema.raw.schema.items.length == parsed_schema.length) return [parsed_schema, promos];

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

	const new_parsed_schema: ParsedSchema[] = [];

	for (let item of schema.raw.schema.items) {
		new_parsed_schema.push({
			def_index: item.defindex,
			item_name: item.item_name.replace("\n", " "),
			proper_name: item.proper_name,
			type: item_type_mapping[item.item_slot] || item.item_slot || item.item_class,
			norm_item_name: Item.normalizeName(item.item_name),
		});
	}

	const new_promos = getPromos(new_parsed_schema);
	saveFile(new_promos, "promos");
	saveFile(new_parsed_schema, "parsed_schema", false);

	return [new_parsed_schema, new_promos];
}

/**
 * Gets all Promo/Strange/Decorated Items that have multiple different def_index. Use via promos[def_index] || def_index. Watch out for bat promo :)
 */
export function getPromos(mod_schema = parsed_schema): NumEnum {
	const doubles: { [key: number]: number } = {
		294: 160, //lugermorph (Vintage / Unique)
	};

	const found = [294];

	for (let i = 0; i < mod_schema.length; i++) {
		const item0 = mod_schema[i];

		if (ignore(item0.def_index, item0.norm_item_name)) continue;

		const promo_name = "promo " + item0.norm_item_name;
		const upgradeable_name = "upgradeable " + item0.norm_item_name;
		for (let j = i + 1; j < mod_schema.length; j++) {
			const item1 = mod_schema[j];
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
 * @returns {Promise<Boolean>} success
 */
export async function saveFile(data: string | any, target: string, fancy = true): Promise<boolean> {
	if (!(data instanceof String)) {
		if (fancy) data = JSON.stringify(data, null, 4);
		else data = JSON.stringify(data);
	}

	let path = "./data/" + target + ".json.temp";
	if (target.startsWith("E")) path = path.replace("/data", "/enums");

	return new Promise(res => {
		writeFile(path, data, err => {
			if (err) {
				console.log("Error writing File (" + path.substring(0, path.length - 5) + "): " + err);
				res(false);
			} else {
				rename(path, path.substring(0, path.length - 5), () => {});
				res(true);
			}
		});
	});
}
