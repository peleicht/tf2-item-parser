import EItemKillstreak from "../enums/EItemKillstreak.js";
import ETraits from "../enums/ETraits.js";
import BaseItem, { global_info } from "../BaseItem.js";
import { Enum, ItemTraits, item_traits, NumEnum } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { TF2ItemType } from "../types/foreign_items.js";
import ESpells from "../enums/ESpells.js";
import { FabricatorItem } from "tf2-backpack/dist/types.js";
import NameItem from "./NameItem.js";
import { spellNames } from "tf2-backpack";
import default_traits from "../data/default_traits.js";
const EPaint = importJSON("/enums/EPaint.json") as Enum;

const from_name_traits: ETraits[] = [
	ETraits.all,
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
export default class TF2Item extends BaseItem {
	private tf2_item?: TF2ItemType;
	private name_item?: NameItem;
	private internal_parsing_done: boolean;

	constructor(tf2_item: TF2ItemType) {
		super({});

		//bp api delivers with defindex instead of def_index and differently formatted attributes
		if (tf2_item.defindex !== undefined) {
			tf2_item.def_index = tf2_item.defindex;
			delete tf2_item.defindex;

			if (tf2_item.name) {
				if (tf2_item.def_index == 5043) {
					this.output_item = {
						item: new NameItem(tf2_item.name), //bpapi give wrapped item as name in wrapped gifts
					};
				} else this.name_item = new NameItem(tf2_item.name);
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

		this.tf2_item = tf2_item;
		this.parsing_done = false;
		this.internal_parsing_done = false;
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

	private scanFor(search_trait: ETraits = ETraits.all) {
		if (this.parsing_done || this.parsing_failed) return;
		if (TF2Item.unknown_traits.includes(search_trait)) return;

		if (this.name_item && from_name_traits.includes(search_trait)) {
			this.name_item.scanFor(search_trait);

			//sync name item with this
			for (let k of item_traits) {
				const key = k as keyof ItemTraits;
				if (!from_name_traits.includes(ETraits[key])) continue;
				const this_value = this[key];
				const that_value = this.name_item[key];
				if (that_value !== undefined && this_value === undefined && default_traits[key] != that_value) this[key] = this.name_item[key] as any;
			}

			if (
				search_trait != ETraits.all &&
				search_trait != ETraits.killstreak &&
				search_trait != ETraits.killstreak_sheen &&
				search_trait != ETraits.killstreaker
			) {
				return this.scanFinish(); //search both
			}
		}

		const this_ref = this;
		if (!this.internal_parsing_done) {
			if (!global_info.tf2_item_parser) throw "Cannot parse TF2 item before init!";

			try {
				const [parsed_item] = global_info.tf2_item_parser.parseBackpack([this.tf2_item as any], false);

				this.def_index = this.correctDefIndex(parsed_item.defindex);
				//@ts-ignore sometimes like this which is not defined in its type
				if (typeof parsed_item.quality == "object") this.quality = parsed_item.quality.id;
				else this.quality = parsed_item.quality;

				this.id = parsed_item.assetid;
				this.tradable = parsed_item.tradable;
				this.craftable = parsed_item.craftable;
				if (this.craftable === false && this.tf2_item!.name) {
					//".flags" attribute missing on bpapi items, so uncraftable get mistaken sometimes, fix here with the name
					if (this.tf2_item!.name && !this.tf2_item!.name.includes("Non-Craftable")) this.craftable = true;
				}
				if (this.tf2_item!.flag_cannot_craft) this.craftable = false;

				if (parsed_item.killstreakTier) this.killstreak = parsed_item.killstreakTier;
				if (parsed_item.sheen) {
					this.killstreak_sheen = parsed_item.sheen;
					if (this.killstreak === undefined || this.killstreak < 2) this.killstreak = 2;
				}
				if (parsed_item.killstreaker) {
					this.killstreaker = parsed_item.killstreaker;
					this.killstreak = 3;
				}

				this.australium = parsed_item.australium;
				this.festivized = parsed_item.festivized;
				this.unusual = parsed_item.effect;
				this.texture = parsed_item.paintkit;
				if (parsed_item.wear) this.wear = Math.round(parsed_item.wear * 5);
				this.strange = this.quality == 11 || parsed_item.elevated;
				if (parsed_item.paint) this.paint = EPaint[parsed_item.paint] as number;
				if (parsed_item.spells) {
					//@ts-ignore typescript doesnt understand reverse mapping
					this.spells = parsed_item.spells.map(s => ESpells[spellNames[s]]);
				}
				if (parsed_item.parts) this.strange_parts = parsed_item.parts;

				this.correctDefIndex();
				this.setSchemaStats();

				this.identifyUses();
				if (this.usable && this.tf2_item!.quantity !== undefined) this.remaining_uses = this.tf2_item!.quantity;

				this.item_number = parsed_item.craft || parsed_item.crateNo || parsed_item.series || parsed_item.medalNo;
				if (!this.name_item) this.target_def_index = parsed_item.target; //use name item if available, bpapi buy orders use wrong def_index

				if (parsed_item.inputItems) {
					if (this.def_index == 20002 || this.def_index == 20000) {
						this.input_items = [];
						for (let item of parsed_item.inputItems) {
							const num_needed = item.numRequired - item.numFulfilled;
							if (num_needed > 0) {
								const base_item = getFItem(item);
								const items = new Array(num_needed).fill(base_item.toString());
								this.input_items = this.input_items!.concat(items);
							}
						}
					}
				}

				if (parsed_item.outputItem) {
					const out_item = getFItem(parsed_item.outputItem);
					if (this.def_index == 20002 || this.def_index == 20000 || this.def_index == 5043) {
						if (!this.output_item) this.output_item = {};
						this.output_item.item = out_item;
						this.killstreak_sheen = out_item.killstreak_sheen;
						this.killstreaker = out_item.killstreaker;
						if (this.killstreaker) this.killstreak = EItemKillstreak["Professional Killstreak"];
						else if (this.killstreak_sheen) this.killstreak_sheen = EItemKillstreak["Specialized Killstreak"];
					} else if (this.def_index == 5661) {
						if (!this.output_item) this.output_item = {};
						this.output_item.def_index = out_item.def_index;
						this.output_item.quality = out_item.quality;
					}
				}
				if (this.def_index == 5661) {
					this.output_item = {
						def_index: this.getTargetDefIndex(),
						quality: 11,
					};
				} else if (this.def_index == 5726) {
					if (!this.killstreak) this.killstreak = 1;
				}
				if (this.tf2_item!.contained_item) {
					if (!this.output_item) this.output_item = {};
					this.output_item.item = new TF2Item(this.tf2_item!.contained_item);
				}
			} catch (err) {
				this.parsing_failed = true;
			}
		}

		this.internal_parsing_done = true;
		this.scanFinish();

		function getFItem(item: FabricatorItem<number>) {
			return new BaseItem({
				def_index: item.defindex,
				quality: item.quality,
				killstreak: item.attributes.killstreakTier,
				killstreak_sheen: item.attributes.sheen,
				killstreaker: item.attributes.killstreaker,
				target_def_index: this_ref.correctDefIndex(item.attributes.target),
			});
		}
	}

	private scanFinish() {
		if (this.name_item?.parsing_done && this.getDefindex() == 20002) {
			this.killstreak = this.name_item.getKillstreak();
			this.target_def_index = this.name_item.getTargetDefIndex();
		}

		if (this.internal_parsing_done && (!this.name_item || this.name_item.parsing_done)) {
			this.parsing_done = true;
			this.isNeverTradable();
			this.getID();
			delete this.tf2_item;
		}
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [ETraits.never_tradable]; //, ETraits.input_items
}

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
