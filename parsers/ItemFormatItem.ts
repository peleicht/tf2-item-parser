import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemWear from "../enums/EItemWear.js";
import ETraits from "../enums/ETraits.js";
import Item from "../Item.js";
import { Enum, ItemTraits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { AllFormatAttributes } from "../types/foreign_items.js";
import EKillstreakSheen from "../enums/EKillstreakSheen.js";
import EKillstreaker from "../enums/EKillstreaker.js";
import ESpells from "../enums/ESpells.js";
import EItemQuality from "../enums/EItemQuality.js";
const EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;
const ETextures = importJSON("/enums/ETextures.json") as Enum;
const EPaints = importJSON("/enums/EPaints.json") as Enum;
const EStrangeParts = importJSON("/enums/EStrangeParts.json") as Enum;

/**
 * Limitations: remaining_uses, input_items, tradable, never_tradable, custom_texture, anything tf2-item-format isnt parsing right (garbage in, garbage out)
 */
export default function parseItemFormatItem(item: AllFormatAttributes): ItemTraits | undefined {
	const traits: ItemTraits = {};

	if (item.defindex !== undefined) traits.def_index = Item.normalizeDefIndex(item.defindex);
	if (typeof item.quality == "number") traits.quality = item.quality;
	//@ts-ignore
	else traits.quality = EItemQuality[item.quality];
	if (traits.quality == 11) traits.strange = true;

	if (item.id) traits.id = item.id;
	if (item.craftable !== undefined) traits.craftable = item.craftable;
	if (item.australium !== undefined) {
		traits.australium = item.australium;
		traits.quality = EItemQuality.Strange;
	}
	if (item.festivized !== undefined) traits.festivized = item.festivized;
	if (item.elevated) traits.strange = true;
	traits.tradable = item.tradable;
	if (traits.tradable === undefined && item.fullName?.startsWith("Non-Tradable")) traits.tradable = false;

	if (typeof item.killstreak == "number") traits.killstreak = item.killstreak;
	//@ts-ignore
	else traits.killstreak = EItemKillstreak[item.killstreak];
	//@ts-ignore
	if (item.sheen) traits.killstreak_sheen = EKillstreakSheen[item.sheen];
	//@ts-ignore
	if (item.killstreaker) traits.killstreaker = EKillstreaker[item.killstreaker];

	if (item.effect !== undefined) {
		if (typeof item.effect == "number") traits.unusual = item.effect;
		else traits.unusual = EUnusualEffects[item.effect] as number;
		traits.quality = EItemQuality.Unusual;
	}

	if (item.texture !== undefined) {
		if (typeof item.texture == "number") traits.texture = item.texture;
		else traits.texture = ETextures[item.texture] as number;
		traits.quality = EItemQuality["Decorated Weapon"];
	}

	if (item.wear !== undefined) {
		if (typeof item.wear == "number") traits.wear = item.wear;
		//@ts-ignore
		else traits.wear = EItemWear[item.wear];
		traits.quality = EItemQuality["Decorated Weapon"];
	}

	if (item.paint !== undefined) traits.paint = EPaints[item.paint] as number;

	if (item.spells !== undefined) {
		traits.spells = [];
		for (let spell of item.spells) {
			//@ts-ignore
			traits.spells.push(ESpells[spell]);
		}
	}

	if (item.parts !== undefined) {
		traits.strange_parts = [];
		for (let part of item.parts) {
			traits.strange_parts.push(EStrangeParts[part] as number);
		}
	}

	if (item.itemNumber) traits.item_number = item.itemNumber.value;
	if (item.targetDefindex && traits.def_index != 20000) traits.target_def_index = item.targetDefindex;

	if (traits.def_index == 5661) {
		//strangifier
		traits.output_item = {
			def_index: traits.target_def_index,
			quality: 11,
		};
	} else if (traits.def_index == 20002) {
		//killstreak kit fabricator
		traits.output_item = {
			item: new Item({
				def_index: 5726,
				quality: 6,
				name: "Kit",
				craftable: false,
				killstreak: item.defindex == 20003 ? EItemKillstreak["Professional Killstreak"] : EItemKillstreak["Specialized Killstreak"],
				target_def_index: traits.target_def_index,
			}),
		};
		traits.killstreak = traits.output_item.item!.killstreak;
	}

	if (item.outputDefindex) {
		if (!traits.output_item) traits.output_item = {};

		if (traits.def_index == 20000) {
			//collectors/strangifier chemistry set
			if (traits.quality == 14) {
				traits.output_item = {
					item: new Item({
						def_index: item.outputDefindex,
						quality: 14,
					}),
				};
				traits.item_number = 3;
			} else {
				traits.output_item = {
					item: new Item({
						def_index: 5661,
						quality: 6,
						name: "Strangifier",
						target_def_index: item.targetDefindex,
					}),
				};
				traits.item_number = 2;
			}
		} else {
			traits.output_item.def_index = item.outputDefindex;
			if (item.outputQuality) {
				if (typeof item.outputQuality == "number") traits.output_item.quality = item.outputQuality;
				//@ts-ignore
				else traits.output_item.quality = EItemQuality[item.outputQuality];
			}
		}
	}

	return traits;
}

export const unknown_traits: ETraits[] = [ETraits.remaining_uses, ETraits.input_items, ETraits.tradable, ETraits.never_tradable];
