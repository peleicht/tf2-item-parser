import EItemKillstreak from "../enums/EItemKillstreak.js";
import EItemQuality from "../enums/EItemQuality.js";
import ETraits from "../enums/ETraits.js";
import BaseItem from "../BaseItem.js";
import { Enum, ItemTraits, item_traits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { EconItemType } from "../types/foreign_items.js";
import NameItem from "./NameItem.js";
import EKillstreakSheen from "../enums/EKillstreakSheen.js";
import EKillstreaker from "../enums/EKillstreaker.js";
import ESpells from "../enums/ESpells.js";
import default_traits from "../data/default_traits.js";
const EPaint = importJSON("/enums/EPaint.json") as Enum;
const EStrangeParts = importJSON("/enums/EStrangeParts.json") as Enum;
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
];

/**
 * Limitations: custom texture
 */
export default class EconItem extends BaseItem {
	private econ_item?: EconItemType;
	private name_item?: NameItem;
	private internal_parsing_done: boolean;

	constructor(econ_item: EconItemType) {
		super({});
		this.econ_item = econ_item;
		this.name_item = new NameItem(econ_item.market_name || econ_item.name, true);
		this.parsing_done = false;
		this.internal_parsing_done = false;

		if (this.econ_item.appid != 440) this.parsing_done = true;
	}

	protected getAttribute(attribute: keyof ItemTraits) {
		if (this[attribute] !== undefined) return this[attribute];

		switch (attribute) {
			case "id":
				this.id = this.econ_item?.assetid;
				break;
			case "tradable":
				if (this.econ_item) this.tradable = Boolean(this.econ_item.tradable);
				break;
			case "never_tradable":
				this.scanFor(ETraits.never_tradable);
				if (this.never_tradable !== undefined) return this.never_tradable;
				this.never_tradable = !this.isTradable();
				break;
			default: {
				this.scanFor(ETraits[attribute]);
			}
		}

		return super.getAttribute(attribute);
	}

	protected setAttribute(attribute: string, value: any) {
		this.fullResolve();
		super.setAttribute(attribute, value);
	}

	private scanFor(search_trait: ETraits = ETraits.all) {
		if (this.parsing_done || this.parsing_failed || EconItem.unknown_traits.includes(search_trait)) return;

		if (from_name_traits.includes(search_trait)) {
			if (!this.name_item!.parsing_done) {
				this.name_item!.scanFor(search_trait);

				//sync name item with this
				for (let k of item_traits) {
					const key = k as keyof ItemTraits;
					if (!from_name_traits.includes(ETraits[key])) continue;
					const this_value = this[key];
					const that_value = this.name_item![key];
					if (that_value !== undefined && this_value === undefined && default_traits[key] != that_value) this[key] = this.name_item![key] as any;
				}
			}

			if (search_trait != ETraits.output_item && search_trait != ETraits.all) return this.scanFinish(); //search both
		}

		const descs = this.econ_item!.descriptions;
		if (descs != undefined) {
			let inside_block: ETraits | undefined = undefined;

			while (descs.length != 0) {
				let start_length = descs.length;

				//empty or random extra info
				if (descs[0].value.startsWith(" ")) {
					descs.shift();
					if (inside_block) {
						if (inside_block == search_trait) return;
						inside_block = undefined;
					}
					continue;
				}

				//input items
				if (inside_block === ETraits.input_items) {
					const desc = descs.shift()!;
					const item_match = desc.value.match(/^(.*) x (\d+)$/);
					if (item_match) {
						if (!this.input_items) this.input_items = [];
						const new_items = new Array(Number(item_match[2])).fill(item_match[1]);
						this.input_items = this.input_items.concat(new_items);
					} else {
						if (search_trait == ETraits.input_items) return;
						inside_block = undefined;
					}
					continue;
				}

				//paint
				if (this.paint === undefined && descs[0].value.startsWith("Paint Color: ")) {
					const desc = descs.shift()!;
					const paint_name = desc.value.substring("Paint Color: ".length);
					this.paint = EPaint[paint_name] as number;
					if (descs.length == 0) break;
					if (search_trait == ETraits.paint) return;
				}

				//strange parts
				if (descs[0].value.startsWith("(")) {
					const desc = descs.shift()!;
					const part_match = desc.value.match(/^\((.*): 0\)$/);
					if (part_match) {
						if (!this.strange_parts) this.strange_parts = [];
						this.strange_parts.push(EStrangeParts[part_match[1]] as number);
						if (descs.length == 0) break;
					} else {
						descs.unshift(desc); //just in case
					}
				}

				//killsteaker
				if (this.killstreaker === undefined && descs[0].value.startsWith("Killstreaker: ")) {
					const desc = descs.shift()!;
					const ks_name = desc.value.substring("Killstreaker: ".length);
					//@ts-ignore
					this.killstreaker = EKillstreaker[ks_name];
					this.killstreak = EItemKillstreak["Professional Killstreak"];
					if (descs.length == 0) break;
					if (search_trait == ETraits.killstreaker || search_trait == ETraits.killstreak) return;
				}

				//killstreak sheen
				if (this.killstreak_sheen === undefined && descs[0].value.startsWith("Sheen: ")) {
					const desc = descs.shift()!;
					const sheen_name = desc.value.substring("Sheen: ".length);
					//@ts-ignore
					this.killstreak_sheen = EKillstreakSheen[sheen_name];
					if (!this.killstreak || this.killstreak < EItemKillstreak["Specialized Killstreak"]) {
						this.killstreak = EItemKillstreak["Specialized Killstreak"];
						if (search_trait == ETraits.killstreak) return;
					}
					if (descs.length == 0) break;
					if (search_trait == ETraits.killstreak_sheen) return;
				}

				//basic killstreak
				if (descs[0].value == "Killstreaks Active") {
					descs.shift();
					if (!this.killstreak || this.killstreak < EItemKillstreak.Killstreak) {
						this.killstreak = EItemKillstreak.Killstreak;
						if (search_trait == ETraits.killstreak) return;
					}
					if (descs.length == 0) break;
				}

				//unusual effect
				if (this.unusual === undefined && descs[0].value.startsWith("★ Unusual Effect: ") && this.getType() != "supply_crate") {
					const desc = descs.shift()!;
					const unu_name = desc.value.substring("★ Unusual Effect: ".length);
					const effect_id = EUnusualEffects[unu_name] as number;
					if (effect_id === undefined) this.parsing_failed = true;
					else this.unusual = effect_id;
					if (this.quality != EItemQuality["Decorated Weapon"]) this.quality = EItemQuality.Unusual;

					if (descs.length == 0) break;
					if (search_trait == ETraits.unusual) return;
				}

				//spells
				if (descs[0].value.startsWith("Halloween: ")) {
					const desc = descs.shift()!;
					const spell_name = desc.value.substring("Halloween: ".length).replace(" (spell only active during event)", "");
					//@ts-ignore
					const spell_id = ESpells[spell_name];
					if (!this.spells) this.spells = [];
					this.spells.push(spell_id);
					inside_block = ETraits.spells;
					if (descs.length == 0) break;
				} else {
					if (inside_block == ETraits.spells) {
						if (search_trait == ETraits.spells) return;
						else inside_block = undefined;
					}
				}

				//input items (start)
				if (this.input_items === undefined && descs[0].value.startsWith("The following are the inputs")) {
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

					this.getOutput(); //generate output_item from name
					if (ks_match) {
						//@ts-ignore
						this.killstreaker = EKillstreaker[ks_match[1]];
						this.output_item!.item!.killstreaker = this.killstreaker;
						this.killstreak = EItemKillstreak["Professional Killstreak"];
					}
					if (sheen_match) {
						const sheen_name = sheen_match[1].length - 1; //remove bracket in text
						//@ts-ignore
						this.killstreak_sheen = EKillstreakSheen[sheen_match[1].substring(0, sheen_name)];
						this.output_item!.item!.killstreak_sheen = this.killstreak_sheen;
						if (!this.killstreak || this.killstreak < EItemKillstreak["Specialized Killstreak"]) {
							this.killstreak = EItemKillstreak["Specialized Killstreak"];
							if (search_trait == ETraits.killstreak) return;
						}
					}

					if (descs.length == 0) break;
					if (search_trait == ETraits.output_item || search_trait == ETraits.killstreak_sheen || search_trait == ETraits.killstreaker) return;
				}

				//usable
				if (this.usable === undefined && descs[0].value == "Unlimited use") {
					descs.shift();
					this.usable = false;
					if (descs.length == 0) break;
					if (search_trait == ETraits.usable) return;
				}
				if (this.usable === undefined && descs[0].value.includes("limited use item. Uses:")) {
					const desc = descs.shift()!;
					this.usable = true;
					const uses_match = desc.value.match(/.* (\d+)/);
					this.remaining_uses = Number(uses_match![1]);
					if (descs.length == 0) break;
					if (search_trait == ETraits.usable || search_trait == ETraits.remaining_uses) return;
				}

				//wrapped gift
				if (this.output_item === undefined && descs[0].value.startsWith("\nContains: ")) {
					const desc = descs.shift()!;
					const item_name = desc.value.substring("\nContains: ".length);
					if (!this.output_item) this.output_item = {};
					this.output_item.item = new NameItem(item_name, true);
					if (descs.length == 0) break;
					if (search_trait == ETraits.output_item) return;
				}

				//craftable
				if (this.craftable === undefined && descs[0].value.startsWith("( Not ")) {
					const desc = descs.shift()!;
					let found_not_tradable = false;
					if (desc.value.includes("Tradable")) {
						this.tradable = false;
						this.never_tradable = true;
						found_not_tradable = true;
					}
					if (desc.value.includes("Crafting")) {
						this.craftable = false;
						if (search_trait == ETraits.craftable) return;
					}
					if ((found_not_tradable && search_trait == ETraits.tradable) || search_trait == ETraits.never_tradable) return;
					if (descs.length == 0) break;
				}

				//tradable
				if (this.tradable === undefined && descs[0].value.startsWith("\nTradable After: ")) {
					descs.shift();
					this.tradable = false;
					this.never_tradable = false;
					if (descs.length == 0) break;
					if (search_trait == ETraits.tradable || search_trait == ETraits.never_tradable) return;
				}

				if (start_length == descs.length) descs.shift(); //unknown description
			}
		}

		this.internal_parsing_done = true;
		this.scanFinish();
	}

	private scanFinish() {
		if (this.internal_parsing_done && this.name_item!.parsing_done) {
			const kills_part = this.strange_parts?.indexOf(87);
			if (kills_part !== undefined && kills_part != -1 && this.def_index !== undefined) {
				if (this.type === undefined) this.setSchemaStats();
				if (this.getType() != "misc") this.strange_parts!.splice(kills_part, 1); //"Kills" strange part is only for cosmetic but looks same as strange weapons
			}

			this.parsing_done = true;
			this.isNeverTradable();
			this.getID();
			delete this.econ_item;
			delete this.name_item;
		}
	}

	fullResolve() {
		this.scanFor();
		this.isNeverTradable();
		this.getID();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [];
}
