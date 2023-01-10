import ETraits from "../enums/ETraits.js";
import BaseItem from "../BaseItem.js";
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
export default class BPURLItem extends BaseItem {
	private url: string;
	private bp_index?: string;
	private name_item?: NameItem;
	private internal_parsing_done: boolean;

	constructor(url: string) {
		super({});
		this.url = url;
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
		if (this.parsing_done || this.parsing_failed || BPURLItem.unknown_traits.includes(search_trait)) return;

		if (!this.name_item) {
			const norm_url = decodeURIComponent(this.url!);
			const regex_match = norm_url.match(reg);
			if (regex_match) {
				const [_, qualities, name, tradable, craftable, index] = regex_match;
				const q_split = qualities.split(" ");
				for (let q of q_split) {
					if (q == "Decorated" || q == "Weapon") {
						this.quality = 15;
						continue;
					}
					//@ts-ignore
					this.quality = EItemQuality[q];
					if (this.quality == EItemQuality.Strange) this.strange = true;
				}

				this.name_item = new NameItem(name.replace("| ", ""), true);
				if (tradable == "Non-Tradable") this.tradable = false;
				if (craftable == "Non-Craftable") this.craftable = false;
				this.bp_index = index;
			} else {
				this.parsing_failed = true;
				this.parsing_done = true;
				return;
			}
		}

		if (from_name_traits.includes(search_trait)) {
			if (this.name_item) {
				this.name_item.scanFor(search_trait);

				//sync name item with this
				for (let k of item_traits) {
					const key = k as keyof ItemTraits;
					if (!from_name_traits.includes(ETraits[key])) continue;
					const this_value = this[key];
					const that_value = this.name_item[key];
					if (that_value !== undefined && this_value === undefined && default_traits[key] != that_value) this[key] = this.name_item[key] as any;
				}
			}

			if (search_trait != ETraits.output_item && search_trait != ETraits.all) return this.scanFinish(); //search both
		}

		if (this.bp_index) {
			if (this.getDefindex() == 9258 || this.getDefindex() == 5661) this.target_def_index = Number(this.bp_index);
			else if (this.getQuality() == EItemQuality.Unusual) this.unusual = Number(this.bp_index);
			else if (this.getType() == "supply_crate") this.item_number = Number(this.bp_index);
			else if (this.getDefindex() == 5726) {
				const index = this.bp_index.split("-");
				this.target_def_index = Number(index[1]);
			} else if (this.getDefindex() == 20000) {
				const index = this.bp_index.split("-");
				if (this.quality == 14) {
					this.output_item = {
						item: new BaseItem({
							def_index: Number(index[1]),
							quality: 14,
						}),
					};
				} else {
					this.output_item = {
						item: new BaseItem({
							def_index: 5661,
							quality: 6,
							name: "Strangifier",
							target_def_index: Number(index[1]),
						}),
					};
				}
			} else if (this.getDefindex() == 20002) {
				const index = this.bp_index.split("-");
				this.output_item = {
					item: new BaseItem({
						def_index: 5726,
						quality: 6,
						name: "Kit",
						craftable: false,
						killstreak: this.getKillstreak(),
						target_def_index: Number(index[2]),
					}),
				};
			}

			delete this.bp_index;
		}

		this.scanFinish();
	}

	private scanFinish() {
		if (this.internal_parsing_done && this.name_item!.parsing_done) {
			this.parsing_done = true;

			delete this.name_item;
		}
	}

	fullResolve() {
		this.scanFor();
		super.fullResolve();
	}

	static unknown_traits: ETraits[] = [
		ETraits.id,
		ETraits.killstreak_sheen,
		ETraits.killstreaker,
		ETraits.paint,
		ETraits.spells,
		ETraits.strange_parts,
		ETraits.input_items,
	];
}
