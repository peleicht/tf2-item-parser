import EItemKillstreak from "../enums/EItemKillstreak.js";
import ETraits from "../enums/ETraits.js";
import BaseItem, { global_info } from "../BaseItem.js";
import { Enum, ItemTraits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { BPDocumentType } from "../types/foreign_items.js";
import ESpells from "../enums/ESpells.js";
import EItemQuality from "../enums/EItemQuality.js";
import Item from "../Item.js";
const EPaint = importJSON("/enums/EPaint.json") as Enum;

/**
 * Limitations: never_tradable, output_item.item.target_def_index
 */
export default class BPDocumentItem extends BaseItem {
	private document_item?: BPDocumentType;

	constructor(document_item: BPDocumentType) {
		super({});

		this.document_item = document_item;
		this.parsing_done = false;
	}

	protected getAttribute(attribute: keyof ItemTraits) {
		if (this[attribute] !== undefined) return this[attribute];

		this.scanFor();

		return super.getAttribute(attribute);
	}

	protected setAttribute(attribute: string, value: any) {
		this.fullResolve();
		super.setAttribute(attribute, value);
	}

	private scanFor() {
		if (this.parsing_done || this.parsing_failed) return;
		if (this.document_item!.appid !== undefined && this.document_item!.appid != 440) {
			this.parsing_failed = true;
			delete this.document_item;
			return;
		}

		const item = this.document_item!;

		if (item.defindex !== undefined) {
			this.def_index = this.correctDefIndex(item.defindex);
			this.setSchemaStats();
		} else {
			this.name = item.baseName;
			const schema_item = global_info.parsed_schema.find(it => it.item_name == this.name);
			if (schema_item == undefined) this.parsing_failed = true;
			else {
				this.def_index = schema_item.def_index;
				this.type = schema_item.type;
				this.needs_the = schema_item.proper_name;
			}
		}

		this.quality = item.quality.id;
		if (item.id) this.id = item.id;
		this.craftable = item.craftable || false;
		this.tradable = item.tradable;

		if (item.killstreakTier) this.killstreak = item.killstreakTier;
		if (item.killstreaker) this.killstreaker = item.killstreaker.id;
		if (item.sheen) this.killstreak_sheen = item.sheen.id;

		this.australium = item.australium;
		if (this.australium) this.quality = EItemQuality.Strange;
		this.festivized = item.festivized;
		if (item.particle) {
			this.unusual = item.particle.id;
			this.quality = EItemQuality.Unusual;
		}
		if (item.texture) {
			this.texture = item.texture.id;
			this.quality = EItemQuality["Decorated Weapon"];
		}
		if (item.wearTier) {
			this.wear = item.wearTier.id;
			this.quality = EItemQuality["Decorated Weapon"];
		}
		this.strange = Boolean(item.elevatedQuality) || this.quality == EItemQuality.Strange;

		if (item.paint) this.paint = EPaint[item.paint.name] as number;

		if (item.spells) {
			this.spells = [];
			for (let spell of item.spells) {
				//@ts-ignore
				this.spells.push(ESpells[spell.name]);
			}
		}

		if (item.strangeParts) {
			this.strange_parts = [];
			for (let part of item.strangeParts) {
				this.strange_parts.push(part.killEater.id);
			}
		}

		this.identifyUses();
		if (this.usable) this.remaining_uses = item.quantity;

		this.item_number = item.crateSeries;

		if (item.recipe) {
			if (this.def_index != 20000) this.target_def_index = this.correctDefIndex(item.recipe.targetItem._source.defindex);

			if (item.recipe.inputItems) {
				this.input_items = [];
				for (let input of item.recipe.inputItems) {
					const ins = new Array(input.quantity).fill(input.name);
					this.input_items = this.input_items!.concat(ins);
				}
			}

			if (this.def_index == 5661) {
				//strangifier
				this.output_item = {
					def_index: this.target_def_index,
					quality: 11,
				};
			} else if (this.def_index == 20002) {
				//killstreak kit fabricator
				this.output_item = {
					item: new BaseItem({
						def_index: 5726,
						quality: 6,
						name: "Kit",
						craftable: false,
						killstreak:
							item.recipe!.outputItem!.defindex == 20002 ? EItemKillstreak["Specialized Killstreak"] : EItemKillstreak["Professional Killstreak"],
						killstreak_sheen: this.killstreak_sheen,
						killstreaker: this.killstreaker,
						target_def_index: this.target_def_index,
					}),
				};
				this.killstreak = this.output_item.item!.killstreak;
				this.killstreak_sheen = this.output_item.item!.killstreak_sheen;
				this.killstreaker = this.output_item.item!.killstreaker;
			}

			if (item.recipe.outputItem) {
				if (!this.output_item) this.output_item = {};

				if (this.def_index == 20000) {
					//collectors/strangifier chemistry set
					if (this.quality == 14) {
						this.output_item = {
							item: new BaseItem({
								def_index: this.correctDefIndex(item.recipe.outputItem.defindex),
								quality: 14,
							}),
						};
						this.item_number = 3;
					} else {
						this.output_item = {
							item: new BaseItem({
								def_index: 5661,
								quality: 6,
								name: "Strangifier",
								target_def_index: this.correctDefIndex(item.recipe.targetItem._source.defindex),
							}),
						};
						this.item_number = 2;
					}
				}
			}
		}

		if (item.containedItem) {
			//traits in here seem unreliable, so just use name
			this.output_item = {
				item: Item.fromItemName(item.containedItem.name),
			};
		}

		this.parsing_done = true;
		delete this.document_item;
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [ETraits.never_tradable];
}
