import { ItemAttributes } from "tf2-item-format/.";
import { ParsedEconItem } from "tf2-item-format/dist/types/index.js";

/**
 * Type for items from the steam api, node-steam-user and node-steamcommunity.
 */
export type EconItemType = {
	assetid: string;
	descriptions?: EconDescription[];
	name: string;
	market_name: string;
	market_hash_name: string;
	tags: EconTag[];
	app_data?: { def_index: number; quality: number; quantity?: string };
	type: string;

	tradable: number | boolean;
	commodity: number | boolean;
	marketable: number | boolean;

	icon_url?: string;
	icon_url_large?: string;
	appid?: number;
	contextid?: string;
	instanceid?: string;
	classid?: string;
	amount?: string;
	currency?: number;
	actions?: EconAction[];
	market_actions?: EconAction[];
	background_color?: string;
	name_color?: string;
	market_tradable_restriction?: number;
	market_marketable_restriction?: number;
	fraudwarnings?: string[];
};
type EconAction = { link: string; name: string };
type EconDescription = {
	value: string;
	type?: string; //"usertext" for custom names/descriptions
	color?: string;
	app_data?: { def_index: number };
};
type EconTag = {
	name?: string;
	category: string;
	internal_name: string;
	localized_category_name?: string;
	localized_tag_name?: string;
	color?: string;
};

/**
 * Type for items from the node-tf2 module and some older backpack.tf api endpoints.
 */
export interface TF2ItemType {
	id: string;
	defindex?: number;
	def_index?: number;
	quality: number;
	flag_cannot_craft?: boolean;
	quantity: number;
	attribute?: TF2Attribute[];
	attributes?: TF2Attribute[];
	contained_item?: TF2ItemType; //following only on items from bp api
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
	appid?: 440;
	baseName: string;
	defindex?: number;
	id?: string;
	name: string;
	imageUrl: string;
	marketName?: string;
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
