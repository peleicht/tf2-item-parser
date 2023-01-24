import ETraits from "../enums/ETraits.js";
import Item from "../Item.js";
import { ItemTraits, item_traits } from "../types/index.js";
import EItemQuality from "../enums/EItemQuality.js";
import NameItem from "./NameItem.js";
import default_traits from "../data/default_traits.js";

//regex for parsing the url: [quality, name, tradable, craftable, index]
const reg = /^https?:\/\/backpack\.tf\/stats\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?([^\/]*)\/?$/;

//next

const from_name_traits: ETraits[] = [
	ETraits.all,
	ETraits.def_index,
	ETraits.name,
	ETraits.killstreak,
	ETraits.australium,
	ETraits.festivized,
	ETraits.texture,
	ETraits.wear,
	ETraits.usable,
	ETraits.remaining_uses,
	ETraits.max_uses,
	ETraits.output_item,
	ETraits.type,
	ETraits.needs_the,
];

/**
 * Limitations: anything not in name
 */
export default function parseBPURLItem(url: string): ItemTraits | undefined {
	const traits: ItemTraits = {};

	const norm_url = decodeURIComponent(url);
	const regex_match = norm_url.match(reg);
	if (!regex_match) return;

	const [_, qualities, name, tradable, craftable, bp_index] = regex_match;
	const q_split = qualities.split(" ");
	for (let q of q_split) {
		if (q == "Decorated" || q == "Weapon") {
			traits.quality = 15;
			continue;
		}
		//@ts-ignore
		traits.quality = EItemQuality[q];
		if (traits.quality == EItemQuality.Strange) traits.strange = true;
	}

	const name_item = Item.fromName(name.replace("| ", ""), true);
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

	if (tradable == "Non-Tradable") traits.tradable = false;
	if (craftable == "Non-Craftable") traits.craftable = false;

	if (bp_index) {
		if (traits.def_index == 9258 || traits.def_index == 5661) traits.target_def_index = Number(bp_index);
		else if (traits.quality == EItemQuality.Unusual) traits.unusual = Number(bp_index);
		else if (traits.type == "supply_crate") traits.item_number = Number(bp_index);
		else if (traits.def_index == 5726) {
			const index = bp_index.split("-");
			traits.target_def_index = Number(index[1]);
		} else if (traits.def_index == 20000) {
			const index = bp_index.split("-");
			if (traits.quality == 14) {
				traits.output_item = {
					item: new Item({
						def_index: Number(index[1]),
						quality: 14,
					}),
				};
			} else {
				traits.output_item = {
					item: new Item({
						def_index: 5661,
						quality: 6,
						name: "Strangifier",
						target_def_index: Number(index[1]),
					}),
				};
			}
		} else if (traits.def_index == 20002) {
			const index = bp_index.split("-");
			traits.output_item = {
				item: new Item({
					def_index: 5726,
					quality: 6,
					name: "Kit",
					craftable: false,
					killstreak: traits.killstreak,
					target_def_index: Number(index[2]),
				}),
			};
		}
	}

	return traits;
}

export const unknown_traits: ETraits[] = [
	ETraits.id,
	ETraits.killstreak_sheen,
	ETraits.killstreaker,
	ETraits.paint,
	ETraits.spells,
	ETraits.strange_parts,
	ETraits.input_items,
];
