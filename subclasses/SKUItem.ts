import ETraits from "../enums/ETraits.js";
import BaseItem from "../BaseItem.js";
import { ItemTraits } from "../types/index.js";

/**
 * Limitations: anything not contained in an items name as well as tradable.
 */
export default class SKUItem extends BaseItem {
	private input_sku: string;
	private split_sku?: string[];

	constructor(sku: string) {
		super({});
		this.input_sku = sku;
		this.parsing_done = false;
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
		if (this.parsing_done || this.parsing_failed || SKUItem.unknown_traits.includes(search_trait)) return;
		if (!this.split_sku) this.split_sku = this.input_sku.split(";");

		try {
			if (this.def_index === undefined) this.def_index = Number(this.split_sku.shift());
			if (this.quality === undefined) this.quality = Number(this.split_sku.shift());
			for (let a of this.split_sku) {
				if (a.startsWith("u")) {
					this.unusual = Number(a.substring(1));
					if (search_trait == ETraits.unusual) return;
				} else if (a == "australium") {
					this.australium = true;
					if (search_trait == ETraits.australium) return;
				} else if (a == "uncraftable") {
					this.craftable = false;
					if (search_trait == ETraits.craftable) return;
				} else if (a.startsWith("w")) {
					this.wear = Number(a.substring(1));
					if (search_trait == ETraits.wear) return;
				} else if (a.startsWith("pk")) {
					this.texture = Number(a.substring(2));
					if (search_trait == ETraits.texture) return;
				} else if (a == "strange") {
					this.strange = true;
					if (search_trait == ETraits.strange) return;
				} else if (a.startsWith("kt-")) {
					this.killstreak = Number(a.substring(3));
					if (search_trait == ETraits.killstreak) return;
				} else if (a.startsWith("td-")) {
					this.target_def_index = Number(a.substring(3));
					if (search_trait == ETraits.target_def_index) return;
				} else if (a == "festive") {
					this.festivized = true;
					if (search_trait == ETraits.festivized) return;
				} else if (a.startsWith("n") || a.startsWith("c")) {
					this.item_number = Number(a.substring(1));
					if (search_trait == ETraits.item_number) return;
				} else if (a.startsWith("od-")) {
					if (!this.output_item) this.output_item = {};
					this.output_item.def_index = Number(a.substring(3));
				} else if (a.startsWith("oq-")) {
					if (!this.output_item) this.output_item = {};
					this.output_item.quality = Number(a.substring(3));
				}
			}
		} catch (err) {
			this.parsing_failed = true;
		}

		this.parsing_done = true;
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [
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
}
