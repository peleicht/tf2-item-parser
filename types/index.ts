import Item from "../Item.js";

export interface Enum {
	[key: string]: number | string;
}
export interface NumEnum {
	[key: string]: number;
}

export interface ItemTraits {
	def_index?: number;
	/**
	 * See EItemQuality
	 */
	quality?: number;
	name?: string;

	id?: string;
	craftable?: boolean;
	/**
	 * See EItemKillstreak
	 */
	killstreak?: number;
	/**
	 * See EKillstreakSheen
	 */
	killstreak_sheen?: number;
	/**
	 * See EKillstreaker
	 */
	killstreaker?: number;
	australium?: boolean;
	festivized?: boolean;
	/**
	 * See EUnusualEffects
	 */
	unusual?: number;
	/**
	 * See ETextures
	 */
	texture?: number;
	/**
	 * See EItemWear
	 */
	wear?: number;
	/**
	 * Used to check for elevated quality.
	 */
	strange?: boolean;

	tradable?: boolean;
	/**
	 * See EPaints
	 */
	paint?: number;
	/**
	 * See ESpells
	 */
	spells?: number[];
	/**
	 * See EStrangeParts
	 */
	strange_parts?: number[];
	usable?: boolean;
	max_uses?: number;
	remaining_uses?: number;

	/**
	 * Possible values: craft number, crate number, chemistry set series, medal number
	 */
	item_number?: number;
	/**
	 * def_index of item that this can be used on (not specified on fabricator sets)
	 */
	target_def_index?: number;
	/**
	 * input items required for this item to become usable (on fabricators, chemistry sets)
	 */
	input_items?: string[];
	/**
	 * item resulting from the use of this item, either .def_index and .quality or .item is defined
	 */
	output_item?: {
		/**
		 * on strangifier: output def_index and quality 11
		 */
		def_index?: number;
		quality?: number;
		/**
		 * on collectors chemistry set: collectors item
		 *
		 * on strangifier chemistry set and kit fabricator: strangifier/kit with target_def_index
		 */
		item?: Item;
	};

	type?: ItemType;
	needs_the?: boolean;
	/**
	 * Some items are untradable now, but may become tradable later (i.e. after buying form the scm).
	 * True if the item is never tradable.
	 */
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
	"strange_parts",
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
	| "supply_crate";
