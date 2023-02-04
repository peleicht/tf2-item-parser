import { ItemAttributes } from "tf2-item-format/.";
import { ParsedEconItem } from "tf2-item-format/dist/types/index.js";
import { NumEnum, StringEnum } from "./index.js";

export type EconItemType = {
	assetid: string;
	descriptions: EconDescription[];
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

export interface TF2ItemType {
	id: string;
	defindex?: number;
	def_index?: number;
	quality: number;
	flag_cannot_craft?: boolean;
	quantity: number;
	attribute?: TF2Attribute[];
	attributes?: TF2Attribute[];
	contained_item?: TF2ItemType; //following only on items from bpapi
	name?: string;
}
export interface TF2Attribute {
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
export interface BPResolvable {
	item: string;
	quality: string;
	tradable: boolean;
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

export interface TF2Schema {
	raw: {
		items_game: any;
		schema: {
			attribute_controlled_attached_particles: {
				id: number;
				name: string;
			}[];
			attributes: SchemaAttribute[];
			items: ProperSchemaItem[];
			items_game_url: string;
			kill_eater_score_types: {
				type: number; //id
				type_name: string;
				level_data: string;
			}[];
			paintkits: {
				[key: number]: string; //textures
			};
			qualities: NumEnum;
			qualitNames: StringEnum;
		};
	};
	time: number; //timestamp
	version: string;
	getAttributeByDefindex: (def_index: number) => SchemaAttribute;
	getEffectById: (id: number) => string;
	getEffectidByName: (name: string) => number;
	getItemByDefindex: (def_index: number) => ProperSchemaItem;
	getItemByItemName: (name: string) => ProperSchemaItem;
	getQualityById: (id: number) => string;
	getQualityIdByName: (name: string) => number;
	getSkinById: (id: number) => string;
	getSkinIdByName: (name: string) => number;
}
interface SchemaAttribute {
	name: string;
	defindex: number;
	attribute_class: string;
	description_string: string;
	description_format: string;
	effect_type: string;
	hidden: boolean;
	stored_as_integer: boolean;
}
interface ProperSchemaItem {
	capabilities: {
		[key: string]: true;
	};
	name: string; //"TF_WEAPON_BAT"
	defindex: number;
	item_class: string; //"tf_weapon_bat"
	item_type_name: string; //"Bat"
	item_name: string; //"Bat", actual base name
	proper_name: false;
	item_slot: string; //"melee",
	model_player: string;
	item_quality: number;
	image_inventory: string;
	min_ilevel: number;
	max_ilevel: number;
	image_url: string;
	image_url_large: string;
	craft_class: string; //"weapon"
	craft_material_type: string; //"weapon"
	used_by_classes: string[];
}
