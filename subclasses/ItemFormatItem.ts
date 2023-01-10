import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemWear from "../enums/EItemWear.js";
import ETraits from "../enums/ETraits.js";
import BaseItem from "../BaseItem.js";
import { Enum, ItemTraits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { AllFormatAttributes } from "../types/foreign_items.js";
import EKillstreakSheen from "../enums/EKillstreakSheen.js";
import EKillstreaker from "../enums/EKillstreaker.js";
import ESpells from "../enums/ESpells.js";
import EItemQuality from "../enums/EItemQuality.js";
const EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;
const ETextures = importJSON("/enums/ETextures.json") as Enum;
const EPaint = importJSON("/enums/EPaint.json") as Enum;
const EStrangeParts = importJSON("/enums/EStrangeParts.json") as Enum;

/**
 * Limitations: remaining_uses, input_items, tradable, never_tradable, custom_texture, anything tf2-item-format isnt parsing right (garbage in, garbage out)
 */
export default class ItemFormatItem extends BaseItem {
	private format_item?: AllFormatAttributes;

	constructor(format_item: AllFormatAttributes) {
		super({});
		this.format_item = format_item;
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
		const item = this.format_item!;

		if (item.defindex !== undefined) this.def_index = this.correctDefIndex(item.defindex);
		if (typeof item.quality == "number") this.quality = item.quality;
		//@ts-ignore
		else this.quality = EItemQuality[item.quality];
		if (this.quality == 11) this.strange = true;

		if (item.id) this.id = item.id;
		if (item.craftable !== undefined) this.craftable = item.craftable;
		if (item.australium !== undefined) {
			this.australium = item.australium;
			this.quality = EItemQuality.Strange;
		}
		if (item.festivized !== undefined) this.festivized = item.festivized;
		if (item.elevated) this.strange = true;
		this.tradable = item.tradable;
		if (this.tradable === undefined && item.fullName?.startsWith("Non-Tradable")) this.tradable = false;

		if (typeof item.killstreak == "number") this.killstreak = item.killstreak;
		//@ts-ignore
		else this.killstreak = EItemKillstreak[item.killstreak];
		//@ts-ignore
		if (item.sheen) this.killstreak_sheen = EKillstreakSheen[item.sheen];
		//@ts-ignore
		if (item.killstreaker) this.killstreaker = EKillstreaker[item.killstreaker];

		if (item.effect !== undefined) {
			if (typeof item.effect == "number") this.unusual = item.effect;
			else this.unusual = EUnusualEffects[item.effect] as number;
			this.quality = EItemQuality.Unusual;
		}

		if (item.texture !== undefined) {
			if (typeof item.texture == "number") this.texture = item.texture;
			else this.texture = ETextures[item.texture] as number;
			this.quality = EItemQuality["Decorated Weapon"];
		}

		if (item.wear !== undefined) {
			if (typeof item.wear == "number") this.wear = item.wear;
			//@ts-ignore
			else this.wear = EItemWear[item.wear];
			this.quality = EItemQuality["Decorated Weapon"];
		}

		if (item.paint !== undefined) this.paint = EPaint[item.paint] as number;

		if (item.spells !== undefined) {
			this.spells = [];
			for (let spell of item.spells) {
				//@ts-ignore
				this.spells.push(ESpells[spell]);
			}
		}

		if (item.parts !== undefined) {
			this.strange_parts = [];
			for (let part of item.parts) {
				this.strange_parts.push(EStrangeParts[part] as number);
			}
		}

		if (item.itemNumber) this.item_number = item.itemNumber.value;
		if (item.targetDefindex && this.def_index != 20000) this.target_def_index = item.targetDefindex;

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
					killstreak: item.defindex == 20003 ? EItemKillstreak["Professional Killstreak"] : EItemKillstreak["Specialized Killstreak"],
					target_def_index: this.correctDefIndex(this.target_def_index),
				}),
			};
			this.killstreak = this.output_item.item!.killstreak;
		}

		if (item.outputDefindex) {
			if (!this.output_item) this.output_item = {};

			if (this.def_index == 20000) {
				//collectors/strangifier chemistry set
				if (this.quality == 14) {
					this.output_item = {
						item: new BaseItem({
							def_index: this.correctDefIndex(item.outputDefindex),
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
							target_def_index: this.correctDefIndex(item.targetDefindex),
						}),
					};
					this.item_number = 2;
				}
			} else {
				this.output_item.def_index = this.correctDefIndex(item.outputDefindex);
				if (item.outputQuality) {
					if (typeof item.outputQuality == "number") this.output_item.quality = item.outputQuality;
					//@ts-ignore
					else this.output_item.quality = EItemQuality[item.outputQuality];
				}
			}
		}

		this.parsing_done = true;
		delete this.format_item;
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [ETraits.remaining_uses, ETraits.input_items, ETraits.tradable, ETraits.never_tradable];
}
