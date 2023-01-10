import { ItemTraits } from "./types/index.js";
import { AllFormatAttributes, BPDocumentType, EconItemType, TF2ItemType } from "./types/foreign_items.js";
import BaseItem, { global_info } from "./BaseItem.js";
import NameItem from "./subclasses/NameItem.js";
import SKUItem from "./subclasses/SKUItem.js";
import EconItem from "./subclasses/EconItem.js";
import TF2Item from "./subclasses/TF2Item.js";
import ItemFormatItem from "./subclasses/ItemFormatItem.js";
import BPDocumentItem from "./subclasses/BPDocument.js";
import BPURLItem from "./subclasses/BPURLItem.js";

export default class Item extends BaseItem {
	constructor(traits: ItemTraits) {
		super(traits);
	}

	static KEY: Item = new BaseItem({ def_index: 5021, quality: 6, name: "Mann Co. Supply Crate Key" });
	static REFINED: Item = new BaseItem({ def_index: 5002, quality: 6, name: "Refined Metal" });
	static RECLAIMED: Item = new BaseItem({ def_index: 5001, quality: 6, name: "Reclaimed Metal" });
	static SCRAP: Item = new BaseItem({ def_index: 5000, quality: 6, name: "Scrap Metal" });
	static FESTIVIZER: Item = new BaseItem({ def_index: 5839, quality: 6, craftable: false, name: "Festivizer" });

	static fromItemName(name: string, strict = false): Item {
		return new NameItem(name, strict);
	}

	static fromSKU(sku: string): Item {
		return new SKUItem(sku);
	}

	static fromEconItem(item: EconItemType): Item {
		return new EconItem(item);
	}

	/**
	 * For the tf2 node module and some older bp api endpoints.
	 */
	static fromTF2(item: TF2ItemType): Item {
		return new TF2Item(item);
	}

	/**
	 * For conversion from the tf2-item-format node module.
	 */
	static fromItemFormat(item: AllFormatAttributes): Item {
		return new ItemFormatItem(item);
	}

	/**
	 * For the newer bp api endpoints.
	 */
	static fromBPDocument(item: BPDocumentType): Item {
		return new BPDocumentItem(item);
	}

	static fromBPURL(url: string): Item {
		return new BPURLItem(url);
	}

	static fromJSON(json: ItemTraits): Item {
		if (json.output_item?.item) {
			if (!(json.output_item.item instanceof BaseItem)) json.output_item.item = Item.fromJSON(json.output_item.item!);
		}
		return new BaseItem(json);
	}
}

const { parsed_schema, promos, ETextures, EUnusualEffects } = global_info;
export { parsed_schema, promos, ETextures, EUnusualEffects };
export * from "./types/foreign_items.js";
export * from "./types/index.js";
export function isReady() {
	return global_info.ready;
}
