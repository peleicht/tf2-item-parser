import EItemKillstreak from "../enums/EItemKillstreak.js";
import ETraits from "../enums/ETraits.js";
import Item, { global_info } from "../Item.js";
import { Enum, ItemTraits, item_traits, NumEnum } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { TF2ItemType } from "../types/foreign_items.js";
import ESpells from "../enums/ESpells.js";
import { FabricatorItem } from "tf2-backpack/dist/types.js";
import { spellNames } from "tf2-backpack";
import default_traits from "../data/default_traits.js";
const EPaints = importJSON("/enums/EPaints.json") as Enum;

const from_name_traits: ETraits[] = [
	ETraits.craftable,
	ETraits.killstreak,
	ETraits.killstreak_sheen,
	ETraits.killstreaker,
	ETraits.target_def_index,
	ETraits.output_item,
];

/**
 * Limitations: never_tradable, input_items & fabricator outputs when from bpapi)
 */
export default function parseTF2Item(tf2_item: TF2ItemType): ItemTraits | undefined {
	const traits: ItemTraits = {};
	let is_bp_api_item = false;
	let name_item: Item | undefined = undefined;

	//bp api delivers with defindex instead of def_index and differently formatted attributes
	if (tf2_item.defindex !== undefined) {
		is_bp_api_item = true;
		tf2_item.def_index = tf2_item.defindex;
		delete tf2_item.defindex;

		if (tf2_item.name) {
			if (tf2_item.def_index == 5043) {
				traits.output_item = {
					item: Item.fromName(tf2_item.name), //bpapi give wrapped item as name in wrapped gifts
				};
			} else {
				name_item = Item.fromName(tf2_item.name);
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
			}
		}

		tf2_item.attribute = [];
		if (tf2_item.attributes) {
			for (let attribute of tf2_item.attributes) {
				if (buffer_type_map[attribute.defindex!] !== undefined) {
					if (attribute.defindex) attribute.def_index = attribute.defindex;
					attribute.value_bytes = {
						type: "Buffer",
						data: numToBuf(attribute.value!, attribute.float_value!, attribute.def_index!),
					};

					delete attribute.defindex;
					delete attribute.float_value;
					delete attribute.value;
					tf2_item.attribute.push(attribute);
				}
			}
		}
		delete tf2_item.defindex;
		delete tf2_item.attributes;
	}

	//sometimes types returned by bp will be wrong
	if (tf2_item.quantity) tf2_item.quantity = Number(tf2_item.quantity);
	for (let a of tf2_item.attribute!) {
		a.def_index = Number(a.def_index);
	}

	if (!global_info.tf2_item_parser) throw "Cannot parse TF2 item before init!";

	try {
		const [parsed_item] = global_info.tf2_item_parser.parseBackpack([tf2_item as any], false);
		if (parsed_item.defindex == undefined) return;

		traits.def_index = Item.normalizeDefIndex(parsed_item.defindex);
		//@ts-ignore sometimes like this which is not defined in its type
		if (typeof parsed_item.quality == "object") traits.quality = parsed_item.quality.id;
		else traits.quality = parsed_item.quality;

		traits.id = parsed_item.assetid;
		traits.tradable = parsed_item.tradable;
		if (!is_bp_api_item) traits.craftable = parsed_item.craftable;
		else traits.craftable = !Boolean(tf2_item!.flag_cannot_craft);

		if (parsed_item.killstreakTier) traits.killstreak = parsed_item.killstreakTier;
		if (parsed_item.sheen) {
			traits.killstreak_sheen = parsed_item.sheen;
			if (traits.killstreak === undefined || traits.killstreak < 2) traits.killstreak = 2;
		}
		if (parsed_item.killstreaker) {
			traits.killstreaker = parsed_item.killstreaker;
			traits.killstreak = 3;
		}

		traits.australium = parsed_item.australium;
		traits.festivized = parsed_item.festivized;
		traits.unusual = parsed_item.effect;
		traits.texture = parsed_item.paintkit;
		if (parsed_item.wear) traits.wear = Math.round(parsed_item.wear * 5);
		traits.strange = traits.quality == 11 || parsed_item.elevated;
		if (parsed_item.paint) traits.paint = EPaints[parsed_item.paint] as number;
		if (parsed_item.spells) {
			//@ts-ignore typescript doesnt understand reverse mapping
			traits.spells = parsed_item.spells.map(s => ESpells[spellNames[s]]);
		}
		if (parsed_item.parts) traits.strange_parts = parsed_item.parts;

		const schema_item = Item.getSchemaItem(traits.def_index);
		if (!schema_item) return;
		traits.name = schema_item.item_name;
		traits.type = schema_item.type;
		traits.needs_the = schema_item.proper_name;
		traits.img = schema_item.img;

		const [usable, max_uses, remaining_uses] = Item.identifyUses(traits.def_index!, traits.name, traits.type)!;
		traits.usable = usable;
		traits.max_uses = max_uses;
		if (usable && tf2_item.quantity !== undefined) traits.remaining_uses = tf2_item.quantity;
		else traits.remaining_uses = remaining_uses;

		traits.item_number = parsed_item.craft || parsed_item.crateNo || parsed_item.series || parsed_item.medalNo;
		if (!name_item) traits.target_def_index = parsed_item.target; //use name item if available, bpapi buy orders use wrong def_index

		if (parsed_item.inputItems) {
			if (traits.def_index == 20002 || traits.def_index == 20000) {
				traits.input_items = [];
				for (let item of parsed_item.inputItems) {
					const num_needed = item.numRequired - item.numFulfilled;
					if (num_needed > 0) {
						const base_item = getFItem(item);
						const items = new Array(num_needed).fill(base_item.toString());
						traits.input_items = traits.input_items!.concat(items);
					}
				}
			}
		}

		if (parsed_item.outputItem) {
			const out_item = getFItem(parsed_item.outputItem);
			if (traits.def_index == 20002 || traits.def_index == 20000 || traits.def_index == 5043) {
				if (!traits.output_item) traits.output_item = {};
				traits.output_item.item = out_item;
				traits.killstreak_sheen = out_item.killstreak_sheen;
				traits.killstreaker = out_item.killstreaker;
				if (traits.killstreaker) traits.killstreak = EItemKillstreak["Professional Killstreak"];
				else if (traits.killstreak_sheen) traits.killstreak_sheen = EItemKillstreak["Specialized Killstreak"];
			} else if (traits.def_index == 5661) {
				if (!traits.output_item) traits.output_item = {};
				traits.output_item.def_index = out_item.def_index;
				traits.output_item.quality = out_item.quality;
			}
		}
		if (traits.def_index == 5661) {
			traits.output_item = {
				def_index: traits.target_def_index,
				quality: 11,
			};
		} else if (traits.def_index == 5726) {
			if (!traits.killstreak) traits.killstreak = 1;
		}
		if (tf2_item.contained_item) {
			if (!traits.output_item) traits.output_item = {};
			traits.output_item.item = Item.fromTF2(tf2_item.contained_item);
		}
	} catch (err) {
		return;
	}

	if (traits.def_index == 20002 && name_item) {
		traits.killstreak = name_item.killstreak;
		traits.target_def_index = name_item.target_def_index;
	}

	return traits;

	function getFItem(item: FabricatorItem<number>) {
		return new Item({
			def_index: item.defindex,
			quality: item.quality,
			killstreak: item.attributes.killstreakTier,
			killstreak_sheen: item.attributes.sheen,
			killstreaker: item.attributes.killstreaker,
			target_def_index: item.attributes.target,
		});
	}
}

export const unknown_traits: ETraits[] = [ETraits.never_tradable, ETraits.input_items];

function numToBuf(num: number, float: number, def_index: number) {
	const b = new ArrayBuffer(4);

	if (buffer_type_map[def_index] === 0) new DataView(b).setUint32(0, num, true);
	else new DataView(b).setFloat32(0, float, true);

	return Array.from(new Uint8Array(b));
}

const buffer_type_map: NumEnum = {
	133: 0, //0 for ints, 1 for floats
	134: 1,
	142: 1,
	187: 1,
	214: 0,
	229: 0,
	261: 1,
	380: 1,
	382: 1,
	384: 1,
	725: 1,
	834: 0,
	1004: 1,
	1005: 1,
	1006: 1,
	1007: 1,
	1008: 1,
	1009: 1,
	2012: 1,
	2013: 1,
	2014: 1,
	2025: 1,
	2027: 1,
	2041: 0,
	2053: 1,
};
