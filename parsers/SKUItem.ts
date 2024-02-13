import Item from "../Item.js";
import ETraits from "../enums/ETraits.js";
import { ItemTraits } from "../types/index.js";

/**
 * Limitations: anything not contained in an items name as well as tradable.
 */
export default function parseSKU(sku: string): ItemTraits | undefined {
	const traits: ItemTraits = {};
	const split_sku = sku.split(";");

	try {
		traits.def_index = Item.normalizeDefIndex(Number(split_sku.shift()));
		traits.quality = Number(split_sku.shift());
		for (let a of split_sku) {
			if (a.startsWith("u") && a != "uncraftable") {
				traits.unusual = Number(a.substring(1));
			} else if (a == "australium") {
				traits.australium = true;
			} else if (a == "uncraftable") {
				traits.craftable = false;
			} else if (a.startsWith("w")) {
				traits.wear = Number(a.substring(1));
			} else if (a.startsWith("pk")) {
				traits.texture = Number(a.substring(2));
			} else if (a == "strange") {
				traits.strange = true;
			} else if (a.startsWith("kt-")) {
				traits.killstreak = Number(a.substring(3));
			} else if (a.startsWith("td-")) {
				traits.target_def_index = Number(a.substring(3));
			} else if (a == "festive") {
				traits.festivized = true;
			} else if (a.startsWith("n") || a.startsWith("c")) {
				traits.item_number = Number(a.substring(1));
			} else if (a.startsWith("od-")) {
				if (!traits.output_item) traits.output_item = {};
				traits.output_item.def_index = Number(a.substring(3));
			} else if (a.startsWith("oq-")) {
				if (!traits.output_item) traits.output_item = {};
				traits.output_item.quality = Number(a.substring(3));
			}
		}
	} catch (err) {
		return;
	}

	if (traits.output_item?.def_index) {
		if (traits.def_index == 20000 && traits.output_item?.def_index != 5661) {
			// restore output item of chemnistry sets
			if (traits.output_item.quality == 14) {
				// collectors sets
				traits.output_item.item = new Item({
					def_index: traits.target_def_index,
					quality: 14,
				});
			} else {
				// strangifier sets
				traits.output_item.item = new Item({
					def_index: 5661,
					name: "Strangifier",
					needs_the: false,
					type: "tool",
					usable: true,
					remaining_uses: 1,
					max_uses: 1,
					target_def_index: traits.target_def_index,
				});
			}
			delete traits.output_item.def_index;
			delete traits.output_item.quality;
		} else if (traits.def_index == 20002) {
			// restore output item of kit fabricators
			traits.output_item.item = new Item({
				def_index: 5726,
				name: "Kit",
				needs_the: false,
				type: "tool",
				usable: true,
				craftable: false,
				remaining_uses: 1,
				max_uses: 1,
				killstreak: traits.killstreak,
				target_def_index: traits.target_def_index,
			});
			delete traits.output_item.def_index;
			delete traits.output_item.quality;
		}
	}

	return traits;
}

export const unknown_traits: ETraits[] = [
	ETraits.id,
	ETraits.killstreak_sheen,
	ETraits.killstreaker,
	ETraits.tradable,
	ETraits.paint,
	ETraits.spells,
	ETraits.strange_parts,
	ETraits.remaining_uses,
	ETraits.input_items,
	ETraits.never_tradable,
];
