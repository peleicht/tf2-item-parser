import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemQuality from "../enums/EItemQuality.js";
import EItemWear from "../enums/EItemWear.js";
import ETraits from "../enums/ETraits.js";
import Item, { global_info, normalizeName, replaceSpecialCharacters } from "../Item.js";
import { Enum, ItemTraits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
const ETextures = importJSON("/enums/ETextures.json") as Enum;
const EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;

const trait_maps = {
	quality_list: [] as string[],
	quality_ids: [] as number[],
	unusual_list: [] as string[],
	unusual_ids: [] as number[],
	texture_list: [] as string[],
	texture_ids: [] as number[],
	wear_list: [] as string[],
	wear_ids: [] as number[],
};

export default function parseName(name: string, strict = false): ItemTraits | undefined {
	let cut_name = normalizeName(name);

	const traits: ItemTraits = {};

	if (cut_name.endsWith(" strangifier")) {
		traits.def_index = 5661;
		traits.name = "Strangifier";
		cut_name = cut_name.substring(0, cut_name.length - " strangifier".length);
	} else if (cut_name.endsWith("kit") && cut_name.includes("killstreak")) {
		traits.def_index = 5726;
		traits.name = "Kit";
		cut_name = cut_name.substring(0, cut_name.length - " kit".length);
	} else if (cut_name.endsWith(" unusualifier")) {
		traits.def_index = 9258;
		traits.name = "Unusualifier";
		cut_name = cut_name.substring(0, cut_name.length - " unusualifier".length);
	} else if (cut_name.includes(" chemistry set")) {
		traits.def_index = 20000;
		traits.name = "Chemistry Set";
		cut_name = cut_name.replace(" strangifier", ""); //optional (can be strangifier or collectors/none)
		cut_name = cut_name.replace(" chemistry set", "");
		cut_name = cut_name.replace(" series", ""); //optional (backpack doesnt show)
	} else if (cut_name.endsWith(" kit fabricator")) {
		traits.def_index = 20002;
		traits.name = "Fabricator";
		cut_name = cut_name.substring(0, cut_name.length - " kit fabricator".length);
	}

	let from_name = undefined;
	let removed_something = true;

	while (true) {
		from_name = getSchemaItemByName(cut_name);
		if (from_name != undefined || cut_name == "") break;
		removed_something = false;
		let start_name: string = cut_name;

		if (traits.tradable === undefined) {
			if (cut_name.startsWith("non tradable ")) {
				traits.tradable = false;
				cut_name = cut_name.substring("non tradable ".length);
			} else if (cut_name.startsWith("untradable ")) {
				traits.tradable = false;
				cut_name = cut_name.substring("untradable".length);
			}
		}

		if (traits.unusual === undefined) {
			const effect = scanFor(cut_name, "unusual");
			if (effect) {
				if (traits.quality != EItemQuality["Decorated Weapon"]) traits.quality = EItemQuality.Unusual;
				traits.unusual = effect;
				const effect_i = trait_maps.unusual_ids.findIndex(id => id == effect)!;
				cut_name = cut_name.substring(trait_maps.unusual_list[effect_i].length + 1);
				removed_something = true;
				continue; //recheck if cut_name is done so as to not parse away "vintage" in vintage tyrolean
			}
		}

		if (traits.craftable === undefined) {
			if (cut_name.startsWith("uncraftable ")) {
				traits.craftable = false;
				cut_name = cut_name.substring("uncraftable ".length);
			} else if (cut_name.startsWith("non-craftable ") || cut_name.startsWith("non craftable ")) {
				traits.craftable = false;
				cut_name = cut_name.substring("non-craftable ".length);
			}
			if (traits.craftable === false) {
				const needs_the = cut_name.startsWith("the "); //"the" can be after non-craftable
				if (needs_the) cut_name = cut_name.substring(4);
				removed_something = true;
				continue; //recheck cut_name
			}
		}
		const quality_check = scanFor(cut_name, "quality");
		if (quality_check) {
			let length = EItemQuality[quality_check].length + 1;
			if (quality_check == EItemQuality.Collectors) length--; // ' in collector's causes problems

			if (traits.quality == undefined || traits.quality == EItemQuality.Strange) traits.quality = quality_check;
			if (traits.quality == EItemQuality.Strange) traits.strange = true;
			cut_name = cut_name.substring(length);
			if (traits.quality == EItemQuality.Unusual) cut_name = normalizeName(cut_name); //the/taunt may be after this
		}
		if (traits.festivized === undefined && cut_name.startsWith("festivized ")) {
			traits.festivized = true;
			cut_name = cut_name.substring("festivized ".length);
		}
		if (traits.killstreak === undefined) {
			if (cut_name.startsWith("professional killstreak")) {
				traits.killstreak = EItemKillstreak["Professional Killstreak"];
				cut_name = cut_name.substring("professional killstreak ".length);
			} else if (cut_name.startsWith("pro ks ")) {
				traits.killstreak = EItemKillstreak["Professional Killstreak"];
				cut_name = cut_name.substring("pro ks ".length);
			} else if (cut_name.startsWith("specialized killstreak")) {
				traits.killstreak = EItemKillstreak["Specialized Killstreak"];
				cut_name = cut_name.substring("specialized killstreak ".length);
			} else if (cut_name.startsWith("spec ks ")) {
				traits.killstreak = EItemKillstreak["Specialized Killstreak"];
				cut_name = cut_name.substring("spec ks ".length);
			} else if (cut_name.startsWith("killstreak")) {
				traits.killstreak = EItemKillstreak.Killstreak;
				cut_name = cut_name.substring("killstreak ".length);
			} else if (cut_name.startsWith("ks ")) {
				traits.killstreak = EItemKillstreak.Killstreak;
				cut_name = cut_name.substring("ks ".length);
			}
		}
		if (cut_name.startsWith("australium ")) {
			traits.australium = true;
			cut_name = cut_name.substring("australium ".length);
		}
		if (traits.texture === undefined) {
			const texture_check = scanFor(cut_name, "texture");
			if (texture_check) {
				traits.quality = EItemQuality["Decorated Weapon"];
				traits.texture = texture_check;
				const texture_i = trait_maps.texture_ids.findIndex(id => id == texture_check)!;
				cut_name = cut_name.substring(trait_maps.texture_list[texture_i].length + 1);
			}
		}

		if (traits.wear === undefined) {
			const wear_check = scanFor(cut_name, "wear");
			if (wear_check) {
				traits.quality = EItemQuality["Decorated Weapon"];
				traits.wear = wear_check;
				cut_name = cut_name.substring(0, cut_name.length - EItemWear[wear_check].length - 1);
			} else traits.wear = EItemWear.NoWear;
		}

		if (traits.remaining_uses === undefined) {
			const match = cut_name.match(/ (\d+)\/(\d+) uses$/);
			if (match) {
				traits.usable = true;
				traits.remaining_uses = Number(match[1]);
				traits.max_uses = Number(match[2]);
				cut_name = cut_name.substring(0, cut_name.length - match[0].length);
			}
		}
		if (traits.item_number === undefined) {
			const match = cut_name.match(/ #(\d+)/); //doing this multiple times rn
			if (match) {
				traits.item_number = Number(match[1]);
				cut_name = cut_name.substring(0, cut_name.length - match[0].length);
				if (cut_name.endsWith(" series")) cut_name = cut_name.substring(0, cut_name.length - " series".length);
			}
		}

		if (cut_name != start_name) removed_something = true;
		if (!removed_something) {
			if (!strict) {
				//remove next word if nothing else, might fix typos
				const next_space = cut_name.indexOf(" ");
				if (next_space == -1) break;
				else {
					cut_name = cut_name.substring(next_space + 1);
					removed_something = true;
				}
			} else break;
		}
	}

	if (!from_name) return;

	if (traits.def_index === undefined) {
		traits.name = from_name.item_name;
		traits.needs_the = from_name.proper_name;
		traits.def_index = from_name.def_index;
	} else {
		//item is special recipe item as defined above
		if (traits.def_index == 20000) {
			//collectors/strangifier chemistry set
			if (traits.quality == 14) {
				traits.output_item = {
					item: new Item({
						def_index: from_name.def_index,
						quality: 14,
						name: from_name.item_name,
						needs_the: from_name.proper_name,
					}),
				};
			} else {
				traits.output_item = {
					item: new Item({
						def_index: 5661,
						quality: 6,
						name: "Strangifier",
						target_def_index: from_name.def_index,
					}),
				};
			}
		} else traits.target_def_index = from_name.def_index;
		if (traits.def_index == 5661) {
			//strangifier
			traits.output_item = {
				def_index: traits.target_def_index,
				quality: 11,
			};
		}
		if (traits.def_index == 20002) {
			//killstreak kit fabricator
			traits.output_item = {
				item: new Item({
					def_index: 5726,
					quality: 6,
					name: "Kit",
					craftable: false,
					killstreak: traits.killstreak,
					target_def_index: from_name.def_index,
				}),
			};
		}

		traits.needs_the = false;
		traits.type = "tool";
		traits.usable = true;
		traits.remaining_uses = 1;
		traits.max_uses = 1;
	}

	return traits;
}

function scanFor(name: string, trait: "quality" | "unusual" | "texture" | "wear"): number | undefined {
	let search;
	if (trait != "wear") search = (w: string) => name.startsWith(w + " ");
	else search = (w: string) => name.endsWith(" " + w);

	//@ts-ignore
	const trait_list = trait_maps[trait + "_list"];
	for (let j = 0; j < trait_list.length; j++) {
		//@ts-ignore
		if (search(trait_list[j])) return Number(trait_maps[trait + "_ids"][j]);
	}

	return undefined;
}

function getSchemaItemByName(name: string) {
	if (!name) return undefined;
	if (name == "key" || name == "keys") return global_info.parsed_schema[5021];
	if (name == "ref" || name == "refined") return global_info.parsed_schema[5002];
	if (name == "rec" || name == "reclaimed") return global_info.parsed_schema[5001];
	if (name == "scrap") return global_info.parsed_schema[5000];

	name = replaceSpecialCharacters(name);

	return global_info.parsed_schema_norm_names[name];
}

export const unknown_traits: ETraits[] = [
	ETraits.id,
	ETraits.killstreak_sheen,
	ETraits.killstreaker,
	ETraits.paint,
	ETraits.spells,
	ETraits.strange_parts,
	ETraits.input_items,
	ETraits.never_tradable,
];

const qs = Object.values(EItemQuality).filter(value => typeof value === "string") as string[];
for (let q of qs) {
	const q_normal = replaceSpecialCharacters(q.toLowerCase());
	trait_maps.quality_list.push(q_normal);
	//@ts-ignore
	trait_maps.quality_ids.push(EItemQuality[q]);
}
const unus = Object.keys(EUnusualEffects).sort((a, b) => b.length - a.length);
for (let u of unus) {
	const u_normal = replaceSpecialCharacters(u.toLowerCase());
	trait_maps.unusual_list.push(u_normal);
	trait_maps.unusual_ids.push(EUnusualEffects[u] as number);
}
const texts = Object.keys(ETextures).sort((a, b) => b.length - a.length);
for (let t of texts) {
	const t_normal = replaceSpecialCharacters(t.toLowerCase());
	trait_maps.texture_list.push(t_normal);
	trait_maps.texture_ids.push(ETextures[t] as number);
}
const ws = Object.values(EItemWear).filter(value => typeof value === "string") as string[];
for (let w of ws) {
	const w_normal = replaceSpecialCharacters(w.toLowerCase());
	trait_maps.wear_list.push(w_normal);
	//@ts-ignore
	trait_maps.wear_ids.push(EItemWear[w]);
}
