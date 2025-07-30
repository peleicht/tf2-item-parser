import CEconItem from "steamcommunity/classes/CEconItem";
import { ItemAttributes } from "tf2-item-format/.";
import { ParsedEconItem } from "tf2-item-format/dist/types/index.js";

/**
 * Type for items from the steam api, node-steam-user, node-steamcommunity and node-tradeoffer-manager.
 */
export type EconItemType = Omit<CEconItem, "getTag" | "getImageURL" | "getLargeImageURL"> & {
	icon_url?: string;
	icon_url_large?: string;
};

/**
 * Type for items from the node-tf2 module and some older backpack.tf api endpoints.
 */
export interface TF2ItemType {
	id: string;
	/**
	 * Only on items from bp api, use def_index for tf2 api
	 */
	defindex?: number;
	/**
	 * Only on items from bp api, use quality for tf2 api
	 */
	def_index?: number;
	level?: number;
	quality: number;
	flag_cannot_craft?: boolean;
	quantity: number;
	attribute?: TF2Attribute[];
	attributes?: TF2Attribute[];
	/**
	 * Only on items from bp api
	 */
	contained_item?: TF2ItemType;
	/**
	 * Only on items from bp api
	 */
	name?: string;
}
interface TF2Attribute {
	defindex?: number;
	def_index?: number;
	value?: number;
	float_value?: number;
	value_bytes?: {
		type: string;
		data: number[];
	};
}

type None<T> = { [K in keyof T]?: never };
type EitherOrBoth<T1, T2> = (T1 & None<T2>) | (T2 & None<T1>) | (T1 & T2);
export type AllFormatAttributes = EitherOrBoth<ItemAttributes, ParsedEconItem>;

/**
 * Type for items from newer backpack.tf api endpoints (snapshot, v2).
 */
export interface BPDocumentType {
	appid?: number;
	baseName: string;
	defindex?: number;
	id?: string;
	imageUrl: string;
	marketName?: string;
	name: string;
	origin?: BPDocumentEntity;
	originalId?: string;
	craftable?: boolean;
	tradable?: boolean;
	crateSeries?: number;
	priceindex?: string;
	killstreakTier?: number;
	sheen: BPDocumentEntity;
	killstreaker: BPDocumentEntity;
	australium?: boolean;
	festivized?: boolean;
	quantity: number;
	quality: BPDocumentEntity;
	summary: string;
	level?: number;
	rarity: BPDocumentEntity;
	paint: BPDocumentEntity;
	particle: BPDocumentEntity;
	texture: BPDocumentEntity;
	wearTier: BPDocumentEntity;
	elevatedQuality: BPDocumentEntity;
	spells: BPDocumentEntity[];
	strangeParts?: {
		score: number;
		killEater: {
			id: number;
			name: string;
			item: BPDocumentType;
		};
	}[];
	recipe?: {
		inputItems: {
			quantity: number;
			name: string;
		}[];
		outputItem?: BPDocumentType;
		targetItem: {
			itemName: string;
			imageUrl: string;
			_source: SchemaItem;
		};
	};
	containedItem?: BPDocumentType;
	tag?: any;
}
interface BPDocumentEntity {
	name: string;
	id: number;
	color?: string;
}
/**
 * Type for items for newer backpack.tf api endpoints (v2). Specifically for items that we send to the api, which is a subset of the full type.
 */
export interface BPDocumentTypeOutgoing {
	appid?: 440;
	baseName: string;
	quality: BPDocumentEntityOutgoing;
	craftable: boolean;
	tradable: boolean;
	priceindex?: string;
	killstreakTier: number;
	sheen?: BPDocumentEntityOutgoing;
	killstreaker?: BPDocumentEntityOutgoing;
	australium: boolean;
	festivized: boolean;
	quantity?: number;
	paint?: BPDocumentEntityOutgoing;
	particle?: BPDocumentEntityOutgoing;
	texture?: BPDocumentEntityOutgoing;
	wearTier?: BPDocumentEntityOutgoing;
	elevatedQuality?: BPDocumentEntityOutgoing;
	spells: BPDocumentEntityOutgoing[];
	strangeParts?: {
		killEater: {
			id: number;
			name?: string;
		};
	}[];
	recipe?: {
		outputItem?: BPDocumentTypeOutgoing;
		targetItem?: {
			itemName: string;
		};
	};
}
interface BPDocumentEntityOutgoing {
	name?: string;
	id?: number;
	color?: string;
}

/**
 * Type for items from old backpack.tf api endpoints (v1).
 */
export interface BPItemV1 {
	item_name: string;
	quality: string | number;
	craftable: boolean;
	priceindex?: number | string;
}

interface SchemaItem {
	name: string;
	defindex: number;
	item_class: string;
	item_type_name: string;
	item_name: string;
	item_description: string;
	proper_name: boolean;
	item_slot: string;
	item_quality: number;
	image_inventory: string;
	min_ilevel: number;
	max_ilevel: number;
	image_url: string;
	image_url_large: string;
	capabilities: capas;
	attributes: {
		name: "kill eater score type";
		class: "kill_eater_score_type";
		value: 100;
	}[];
	tool?: {
		type: string;
	};
	used_by_classes: string[];
}
interface capas {
	[key: string]: true;
}

export interface TradeOfferManagerItem {
	assetid: string;
	appid: 440;
	contextid: 2;
}
