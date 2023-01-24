import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemQuality from "../enums/EItemQuality.js";
import EItemWear from "../enums/EItemWear.js";
import ETraits from "../enums/ETraits.js";
import BaseItem, { global_info } from "../BaseItem.js";
import { Enum, ItemTraits, ParsedSchema } from "../types/index.js";

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

/**
 * Limitations: anything not contained in an items name. If strict is false this.parsing_failed may be false negative.
 */
export default class NameItem extends BaseItem {
	input_name: string;
	private strict: boolean;
	private cut_name?: string;
	private recipe_checked: boolean;

	constructor(name: string, strict = false) {
		super({});
		this.input_name = name;
		this.strict = strict;
		this.parsing_done = false;
		this.recipe_checked = false;
	}

	protected getAttribute(attribute: keyof ItemTraits) {
		if (this[attribute] !== undefined) return this[attribute];
		this.scanFor(ETraits[attribute]);

		return super.getAttribute(attribute);
	}

	protected setAttribute(attribute: string, value: any) {
		this.fullResolve();
		super.setAttribute(attribute, value);
	}

	/**
	 * Cant manually assign traits until fully resolved right now (finish scanFor before assignment?)
	 * @param trait
	 * @returns
	 */
	scanFor(search_trait: ETraits = ETraits.all) {
		if (this.parsing_done || this.parsing_failed || NameItem.unknown_traits.includes(search_trait)) return;
		if (!this.cut_name) this.cut_name = NameItem.normalizeName(this.input_name);

		if (!this.recipe_checked) {
			if (this.cut_name.endsWith(" strangifier")) {
				this.def_index = 5661;
				this.name = "Strangifier";
				this.cut_name = this.cut_name.substring(0, this.cut_name.length - " strangifier".length);
			} else if (this.cut_name.endsWith("kit") && this.cut_name.includes("killstreak")) {
				this.def_index = 5726;
				this.name = "Kit";
				this.cut_name = this.cut_name.substring(0, this.cut_name.length - " kit".length);
			} else if (this.cut_name.endsWith(" unusualifier")) {
				this.def_index = 9258;
				this.name = "Unusualifier";
				this.cut_name = this.cut_name.substring(0, this.cut_name.length - " unusualifier".length);
			} else if (this.cut_name.includes(" chemistry set")) {
				this.def_index = 20000;
				this.name = "Chemistry Set";
				this.cut_name = this.cut_name.replace(" strangifier", ""); //optional (can be strangifier or collectors/none)
				this.cut_name = this.cut_name.replace(" chemistry set", "");
				this.cut_name = this.cut_name.replace(" series", ""); //optional (backpack doesnt show)
			} else if (this.cut_name.endsWith(" kit fabricator")) {
				this.def_index = 20002;
				this.name = "Fabricator";
				this.cut_name = this.cut_name.substring(0, this.cut_name.length - " kit fabricator".length);
			}
			this.recipe_checked = true;
		}

		let from_name = undefined;
		let removed_something = true;

		while (true) {
			from_name = this.getSchemaItemByName(this.cut_name);
			if (from_name != undefined || this.cut_name == "") break;
			removed_something = false;
			let start_name: string = this.cut_name;

			if (this.tradable === undefined) {
				if (this.cut_name.startsWith("non tradable ")) {
					this.tradable = false;
					this.cut_name = this.cut_name.substring("non tradable ".length);
				} else if (this.cut_name.startsWith("untradable ")) {
					this.tradable = false;
					this.cut_name = this.cut_name.substring("untradable".length);
				}
				if (search_trait == ETraits.tradable) return;
			}

			if (this.unusual === undefined) {
				const effect = scanFor(this.cut_name, "unusual");
				if (effect) {
					if (this.quality != EItemQuality["Decorated Weapon"]) this.quality = EItemQuality.Unusual;
					this.unusual = effect;
					const effect_i = trait_maps.unusual_ids.findIndex(id => id == effect)!;
					this.cut_name = this.cut_name.substring(trait_maps.unusual_list[effect_i].length + 1);
					if (search_trait == ETraits.unusual) return;
					removed_something = true;
					continue; //recheck if this.cut_name is done so as to not parse away "vintage" in vintage tyrolean
				}
			}

			if (this.craftable === undefined) {
				if (this.cut_name.startsWith("uncraftable ")) {
					this.craftable = false;
					this.cut_name = this.cut_name.substring("uncraftable ".length);
				} else if (this.cut_name.startsWith("non-craftable ") || this.cut_name.startsWith("non craftable ")) {
					this.craftable = false;
					this.cut_name = this.cut_name.substring("non-craftable ".length);
				}
				if (this.craftable === false) {
					const needs_the = this.cut_name.startsWith("the "); //"the" can be after non-craftable
					if (needs_the) this.cut_name = this.cut_name.substring(4);
					if (search_trait == ETraits.craftable) return;
					removed_something = true;
					continue; //recheck this.cut_name
				}
			}
			const quality_check = scanFor(this.cut_name, "quality");
			if (quality_check) {
				let length = EItemQuality[quality_check].length + 1;
				if (quality_check == EItemQuality.Collectors) length--; // ' in collector's causes problems

				if (this.quality == undefined || this.quality == EItemQuality.Strange) this.quality = quality_check;
				if (this.quality == EItemQuality.Strange) this.strange = true;
				this.cut_name = this.cut_name.substring(length);
				if (this.quality == EItemQuality.Unusual) this.cut_name = NameItem.normalizeName(this.cut_name); //the/taunt may be after this
			}
			if (this.festivized === undefined && this.cut_name.startsWith("festivized ")) {
				this.festivized = true;
				this.cut_name = this.cut_name.substring("festivized ".length);
				if (search_trait == ETraits.festivized) return;
			}
			if (this.killstreak === undefined) {
				if (this.cut_name.startsWith("professional killstreak")) {
					this.killstreak = EItemKillstreak["Professional Killstreak"];
					this.cut_name = this.cut_name.substring("professional killstreak ".length);
					if (search_trait == ETraits.killstreak) return;
				} else if (this.cut_name.startsWith("pro ks ")) {
					this.killstreak = EItemKillstreak["Professional Killstreak"];
					this.cut_name = this.cut_name.substring("pro ks ".length);
					if (search_trait == ETraits.killstreak) return;
				} else if (this.cut_name.startsWith("specialized killstreak")) {
					this.killstreak = EItemKillstreak["Specialized Killstreak"];
					this.cut_name = this.cut_name.substring("specialized killstreak ".length);
					if (search_trait == ETraits.killstreak) return;
				} else if (this.cut_name.startsWith("spec ks ")) {
					this.killstreak = EItemKillstreak["Specialized Killstreak"];
					this.cut_name = this.cut_name.substring("spec ks ".length);
					if (search_trait == ETraits.killstreak) return;
				} else if (this.cut_name.startsWith("killstreak")) {
					this.killstreak = EItemKillstreak.Killstreak;
					this.cut_name = this.cut_name.substring("killstreak ".length);
					if (search_trait == ETraits.killstreak) return;
				} else if (this.cut_name.startsWith("ks ")) {
					this.killstreak = EItemKillstreak.Killstreak;
					this.cut_name = this.cut_name.substring("ks ".length);
					if (search_trait == ETraits.killstreak) return;
				}
			}
			if (this.cut_name.startsWith("australium ")) {
				this.australium = true;
				this.cut_name = this.cut_name.substring("australium ".length);
				if (search_trait == ETraits.australium) return;
			}
			if (this.texture === undefined) {
				const texture_check = scanFor(this.cut_name, "texture");
				if (texture_check) {
					this.quality = EItemQuality["Decorated Weapon"];
					this.texture = texture_check;
					const texture_i = trait_maps.texture_ids.findIndex(id => id == texture_check)!;
					this.cut_name = this.cut_name.substring(trait_maps.texture_list[texture_i].length + 1);
					if (search_trait == ETraits.texture) return;
				}
			}

			if (this.wear === undefined) {
				const wear_check = scanFor(this.cut_name, "wear");
				if (wear_check) {
					this.quality = EItemQuality["Decorated Weapon"];
					this.wear = wear_check;
					this.cut_name = this.cut_name.substring(0, this.cut_name.length - EItemWear[wear_check].length - 1);
				} else this.wear = EItemWear.NoWear;
				if (search_trait == ETraits.wear) return;
			}

			if (this.remaining_uses === undefined) {
				const match = this.cut_name.match(/ (\d+)\/(\d+) uses$/);
				if (match) {
					this.usable = true;
					this.remaining_uses = Number(match[1]);
					this.max_uses = Number(match[2]);
					this.cut_name = this.cut_name.substring(0, this.cut_name.length - match[0].length);
				}
				if (search_trait == ETraits.usable || search_trait == ETraits.remaining_uses || search_trait == ETraits.max_uses) return;
			}
			if (this.item_number === undefined) {
				const match = this.cut_name.match(/ #(\d+)/); //doing this multiple times rn
				if (match) {
					this.item_number = Number(match[1]);
					this.cut_name = this.cut_name.substring(0, this.cut_name.length - match[0].length);
					if (this.cut_name.endsWith(" series")) this.cut_name = this.cut_name.substring(0, this.cut_name.length - " series".length);
				}
				if (search_trait == ETraits.item_number) return;
			}

			if (this.cut_name != start_name) removed_something = true;
			if (!removed_something) {
				if (!this.strict) {
					//remove next word if nothing else, might fix typos
					const next_space = this.cut_name.indexOf(" ");
					if (next_space == -1) break;
					else {
						this.cut_name = this.cut_name.substring(next_space + 1);
						removed_something = true;
					}
				} else break;
			}
		}

		if (from_name) {
			if (this.def_index === undefined) {
				this.name = from_name.item_name;
				this.needs_the = from_name.proper_name;
				this.def_index = from_name.def_index;
			} else {
				//item is special recipe item as defined above
				if (this.def_index == 20000) {
					//collectors/strangifier chemistry set
					if (this.quality == 14) {
						this.output_item = {
							item: new BaseItem({
								def_index: from_name.def_index,
								quality: 14,
								name: from_name.item_name,
								needs_the: from_name.proper_name,
							}),
						};
					} else {
						this.output_item = {
							item: new BaseItem({
								def_index: 5661,
								quality: 6,
								name: "Strangifier",
								target_def_index: from_name.def_index,
							}),
						};
					}
				} else this.target_def_index = from_name.def_index;
				if (this.def_index == 5661) {
					//strangifier
					this.output_item = {
						def_index: this.target_def_index,
						quality: 11,
					};
				}
				if (this.def_index == 20002) {
					//killstreak kit fabricator
					this.output_item = {
						item: new BaseItem({
							def_index: 5726,
							quality: 6,
							name: "Kit",
							craftable: false,
							killstreak: this.killstreak,
							target_def_index: from_name.def_index,
						}),
					};
				}

				this.needs_the = false;
				this.type = "tool";
				this.usable = true;
				this.remaining_uses = 1;
				this.max_uses = 1;
			}
		} else {
			this.parsing_failed = true;
		}

		this.parsing_done = true;

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
	}

	private getSchemaItemByName(name: string) {
		if (!name) return undefined;
		if (name == "key" || name == "keys") return global_info.parsed_schema[5021];
		if (name == "ref" || name == "refined") return global_info.parsed_schema[5002];
		if (name == "rec" || name == "reclaimed") return global_info.parsed_schema[5001];
		if (name == "scrap") return global_info.parsed_schema[5000];

		name = NameItem.replaceSpecialCharacters(name);

		return global_info.parsed_schema_norm_names[name];
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [
		ETraits.id,
		ETraits.killstreak_sheen,
		ETraits.killstreaker,
		ETraits.paint,
		ETraits.spells,
		ETraits.strange_parts,
		ETraits.input_items,
		ETraits.never_tradable,
	];
}

const qs = Object.values(EItemQuality).filter(value => typeof value === "string") as string[];
for (let q of qs) {
	const q_normal = NameItem.replaceSpecialCharacters(q.toLowerCase());
	trait_maps.quality_list.push(q_normal);
	//@ts-ignore
	trait_maps.quality_ids.push(EItemQuality[q]);
}
const unus = Object.keys(EUnusualEffects).sort((a, b) => b.length - a.length);
for (let u of unus) {
	const u_normal = NameItem.replaceSpecialCharacters(u.toLowerCase());
	trait_maps.unusual_list.push(u_normal);
	trait_maps.unusual_ids.push(EUnusualEffects[u] as number);
}
const texts = Object.keys(ETextures).sort((a, b) => b.length - a.length);
for (let t of texts) {
	const t_normal = NameItem.replaceSpecialCharacters(t.toLowerCase());
	trait_maps.texture_list.push(t_normal);
	trait_maps.texture_ids.push(ETextures[t] as number);
}
const ws = Object.values(EItemWear).filter(value => typeof value === "string") as string[];
for (let w of ws) {
	const w_normal = NameItem.replaceSpecialCharacters(w.toLowerCase());
	trait_maps.wear_list.push(w_normal);
	//@ts-ignore
	trait_maps.wear_ids.push(EItemWear[w]);
}
