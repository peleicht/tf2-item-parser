import Item from "../Item.js";

export interface Enum {
	[key: string]: number | string;
}
export interface NumEnum {
	[key: string]: number;
}

export interface ItemTraits {
	def_index?: number;
	quality?: number;
	name?: string;

	id?: string;
	craftable?: boolean;
	killstreak?: number;
	killstreak_sheen?: number;
	killstreaker?: number;
	australium?: boolean;
	festivized?: boolean;
	unusual?: number;
	texture?: number;
	wear?: number;
	strange?: boolean;

	tradable?: boolean;
	paint?: number;
	spells?: number[];
	strange_parts?: number[];
	usable?: boolean;
	max_uses?: number;
	remaining_uses?: number;

	item_number?: number; //craft number, crate number, chemistry set series, medal number
	target_def_index?: number; //def_index of item that this can be used on (not specified on fabricator sets)
	input_items?: string[]; //input items required for this item to become usable (on fabricators, chemistry sets)
	output_item?: {
		//item resulting from the use of this item, either def_index and quality or item is defined
		def_index?: number; //strangifier: output def_index and quality 11
		quality?: number;
		item?: Item; //collectors chemistry set: collectors item, strangifier chemistry set and kit fabricator: strangifier/kit with target_def_index
	};

	type?: ItemType;
	needs_the?: boolean;
	never_tradable?: boolean;

	img?: string;
}
export const item_traits = [
	"def_index",
	"quality",
	"name",
	"id",
	"craftable",
	"killstreak",
	"killstreak_sheen",
	"killstreaker",
	"australium",
	"festivized",
	"unusual",
	"texture",
	"wear",
	"strange",
	"tradable",
	"paint",
	"spells",
	"usable",
	"max_uses",
	"remaining_uses",
	"item_number",
	"target_def_index",
	"input_items",
	"output_item",
	"type",
	"needs_the",
	"never_tradable",
	"img",
];

export interface ParsedSchema {
	[key: string]: ParsedSchemaEntry;
}
export interface ParsedSchemaEntry {
	def_index: number;
	item_name: string;
	proper_name: boolean;
	type: ItemType;
	norm_item_name: string;
	img: string;
}

export type ItemType =
	| "weapon"
	| "misc"
	| "taunt"
	| "action" //usables that give other items (without keys or other inputs) or items that go in the action slot i.e. unlocked crates, noise makers
	| "craft_item"
	| "utility" //mannpower internal items i.e. power ups
	| "map_token" //map stamps
	| "bundle"
	| "tool" //i.e. keys, paints
	| "supply_crate"
	| "unknown"; //type if item wasnt found in schema
