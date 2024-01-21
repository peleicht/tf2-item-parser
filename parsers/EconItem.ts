import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemQuality from "../enums/EItemQuality.js";
import ETraits from "../enums/ETraits.js";
import EStrangeParts from "../enums/EStrangeParts.js";
import { Enum, ItemTraits, item_traits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { EconItemType } from "../types/foreign_items.js";
import EKillstreakSheen from "../enums/EKillstreakSheen.js";
import EKillstreaker from "../enums/EKillstreaker.js";
import ESpells from "../enums/ESpells.js";
import default_traits from "../data/default_traits.js";
import Item from "../Item.js";
const EPaints = importJSON("/enums/EPaints.json") as Enum;
const EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;

const from_name_traits: ETraits[] = [
	ETraits.all,
	ETraits.def_index,
	ETraits.quality,
	ETraits.name,
	ETraits.killstreak,
	ETraits.australium,
	ETraits.festivized,
	ETraits.texture,
	ETraits.wear,
	ETraits.strange,
	ETraits.item_number,
	ETraits.target_def_index,
	ETraits.output_item,
	ETraits.type,
	ETraits.needs_the,
	ETraits.img,
];

/**
 * Limitations: custom texture
 */
export default function parseEconItem(econ_item: EconItemType): ItemTraits | undefined {
	const traits: ItemTraits = {};

	traits.id = econ_item.assetid;
	traits.tradable = Boolean(econ_item.tradable);

	const name_item = Item.fromName(econ_item.market_name || econ_item.name, true);
	if (!name_item) return;

	//sync name item with this
	for (let k of item_traits) {
		const key = k as keyof ItemTraits;
		if (!from_name_traits.includes(ETraits[key])) continue;
		const this_value = traits[key];
		const that_value = name_item[key];
		//@ts-ignore
		if (that_value !== undefined && this_value === undefined && default_traits[key] != that_value) traits[key] = name_item[key] as any;
	}

	const descs = econ_item.descriptions?.slice();
	if (descs != undefined) {
		let inside_block: ETraits | undefined = undefined;

		while (descs.length != 0) {
			let start_length = descs.length;

			//empty or random extra info
			if (descs[0].value.startsWith(" ") || descs[0].type == "usertext") {
				descs.shift();
				if (inside_block) inside_block = undefined;

				continue;
			}

			//input items
			if (inside_block === ETraits.input_items) {
				const desc = descs.shift()!;
				const item_match = desc.value.match(/^(.*) x (\d+)$/);
				if (item_match) {
					if (!traits.input_items) traits.input_items = [];
					const new_items = new Array(Number(item_match[2])).fill(item_match[1]);
					traits.input_items = traits.input_items.concat(new_items);
				} else {
					inside_block = undefined;
				}
				continue;
			}

			//paint
			if (traits.paint === undefined && descs[0].value.startsWith("Paint Color: ")) {
				const desc = descs.shift()!;
				const paint_name = desc.value.substring("Paint Color: ".length);
				traits.paint = EPaints[paint_name] as number;
				if (descs.length == 0) break;
			}

			//strange parts
			if (descs[0].value.startsWith("(")) {
				const desc = descs.shift()!;
				const part_match = desc.value.match(/^\((.*): 0\)$/);
				if (part_match) {
					if (!traits.strange_parts) traits.strange_parts = [];
					//@ts-ignore
					const part = EStrangeParts[part_match[1]] as number | undefined;
					if (part) traits.strange_parts.push(part);
					if (descs.length == 0) break;
				} else {
					descs.unshift(desc); //just in case
				}
			}

			//killsteaker
			if (traits.killstreaker === undefined && descs[0].value.startsWith("Killstreaker: ")) {
				const desc = descs.shift()!;
				const ks_name = desc.value.substring("Killstreaker: ".length);
				//@ts-ignore
				traits.killstreaker = EKillstreaker[ks_name];
				traits.killstreak = EItemKillstreak["Professional Killstreak"];
				if (descs.length == 0) break;
			}

			//killstreak sheen
			if (traits.killstreak_sheen === undefined && descs[0].value.startsWith("Sheen: ")) {
				const desc = descs.shift()!;
				const sheen_name = desc.value.substring("Sheen: ".length);
				//@ts-ignore
				traits.killstreak_sheen = EKillstreakSheen[sheen_name];
				if (!traits.killstreak || traits.killstreak < EItemKillstreak["Specialized Killstreak"]) {
					traits.killstreak = EItemKillstreak["Specialized Killstreak"];
				}
				if (descs.length == 0) break;
			}

			//basic killstreak
			if (descs[0].value == "Killstreaks Active") {
				descs.shift();
				if (!traits.killstreak || traits.killstreak < EItemKillstreak.Killstreak) {
					traits.killstreak = EItemKillstreak.Killstreak;
				}
				if (descs.length == 0) break;
			}

			//unusual effect
			if (traits.unusual === undefined && descs[0].value.startsWith("★ Unusual Effect: ") && traits.type != "supply_crate") {
				const desc = descs.shift()!;
				const unu_name = desc.value.substring("★ Unusual Effect: ".length);
				const effect_id = EUnusualEffects[unu_name] as number;
				if (effect_id === undefined) return;
				else traits.unusual = effect_id;
				if (traits.quality != EItemQuality["Decorated Weapon"]) traits.quality = EItemQuality.Unusual;

				if (descs.length == 0) break;
			}

			//spells
			if (descs[0].value.startsWith("Halloween: ")) {
				const desc = descs.shift()!;
				const spell_name = desc.value.substring("Halloween: ".length).replace(" (spell only active during event)", "");
				//@ts-ignore
				const spell_id = ESpells[spell_name];
				if (!traits.spells) traits.spells = [];
				traits.spells.push(spell_id);
				inside_block = ETraits.spells;
				if (descs.length == 0) break;
			} else {
				if (inside_block == ETraits.spells) {
					inside_block = undefined;
				}
			}

			//input items (start)
			if (traits.input_items === undefined && descs[0].value.startsWith("The following are the inputs")) {
				descs.shift();
				inside_block = ETraits.input_items;
				continue;
			}

			//output item
			if (descs[0].value.startsWith("You will receive")) {
				descs.shift(); //"You will receive..."
				descs.shift(); //Item name (get that from name already)
				let desc = descs.shift()!; //killstreaker / sheen

				const ks_match = desc.value.match(/Killstreaker: (.+),/);
				const sheen_match = desc.value.match(/Sheen: (.+)/);
				if (!ks_match && !sheen_match) continue;

				if (ks_match) {
					//@ts-ignore
					traits.killstreaker = EKillstreaker[ks_match[1]];
					if (traits.output_item?.item) traits.output_item.item.killstreaker = traits.killstreaker!;
					traits.killstreak = EItemKillstreak["Professional Killstreak"];
				}
				if (sheen_match) {
					const sheen_name = sheen_match[1].length - 1; //remove bracket in text
					//@ts-ignore
					traits.killstreak_sheen = EKillstreakSheen[sheen_match[1].substring(0, sheen_name)];
					if (traits.output_item?.item) traits.output_item.item.killstreak_sheen = traits.killstreak_sheen!;
					if (!traits.killstreak || traits.killstreak < EItemKillstreak["Specialized Killstreak"]) {
						traits.killstreak = EItemKillstreak["Specialized Killstreak"];
					}
				}

				if (descs.length == 0) break;
			}

			//usable
			if (traits.usable === undefined && descs[0].value == "Unlimited use") {
				descs.shift();
				traits.usable = false;
				if (descs.length == 0) break;
			}
			if (traits.usable === undefined && descs[0].value.includes("limited use item. Uses:")) {
				const desc = descs.shift()!;
				traits.usable = true;
				const uses_match = desc.value.match(/.* (\d+)/);
				traits.remaining_uses = Number(uses_match![1]);
				if (descs.length == 0) break;
			}

			//wrapped gift
			if (traits.output_item === undefined && descs[0].value.startsWith("\nContains: ")) {
				const desc = descs.shift()!;
				const item_name = desc.value.substring("\nContains: ".length);
				if (!traits.output_item) traits.output_item = {};
				traits.output_item.item = Item.fromName(item_name, true);
				if (descs.length == 0) break;
			}

			//craftable
			if (traits.craftable === undefined && descs[0].value.startsWith("( Not ")) {
				const desc = descs.shift()!;
				if (desc.value.includes("Tradable")) {
					traits.tradable = false;
					traits.never_tradable = true;
				}
				if (desc.value.includes("Crafting")) {
					traits.craftable = false;
				}
				if (descs.length == 0) break;
			}

			//tradable
			if (descs[0].value.startsWith("\nTradable After: ")) {
				descs.shift();
				traits.tradable = false;
				traits.never_tradable = false;
				if (descs.length == 0) break;
			}

			if (start_length == descs.length) descs.shift(); //unknown description
		}
	}

	const quality_tag = econ_item.tags?.find(tag => tag.category == "Quality");
	if (quality_tag?.internal_name == "Normal") traits.quality = EItemQuality.Normal; // normal quality is not in the name

	if (traits.never_tradable === undefined) traits.never_tradable = !traits.tradable;

	const kills_part = traits.strange_parts?.indexOf(87);
	if (kills_part !== undefined && kills_part != -1 && traits.def_index !== undefined) {
		if (traits.type != "misc") traits.strange_parts!.splice(kills_part, 1); //"Kills" strange part is only for cosmetic but looks same as strange weapons
	}

	if (econ_item.icon_url_large || econ_item.icon_url) {
		traits.img = "https://steamcommunity-a.akamaihd.net/economy/image/" + (econ_item.icon_url_large || econ_item.icon_url);
	}

	return traits;
}

export const unknown_traits: ETraits[] = [];
