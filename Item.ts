import { BackpackParser } from "tf2-backpack";

import { Enum, ItemTraits, ItemType, item_traits, NumEnum, ParsedSchema, ParsedSchemaEntry } from "./types/index.js";
import { makeSchema, parseSchema, updateTextures, updateUnusuals } from "./lib/helpers.js";
import default_traits from "./data/default_traits.js";

import EItemKillstreak from "./enums/EItemKillstreak.js";
import EItemQuality from "./enums/EItemQuality.js";
import EItemWear from "./enums/EItemWear.js";
import EKillstreaker from "./enums/EKillstreaker.js";
import EKillstreakSheen from "./enums/EKillstreakSheen.js";
import ESpells from "./enums/ESpells.js";
import ETraits from "./enums/ETraits.js";

import importJSON from "./types/importJSON.js";
import {
	AllFormatAttributes,
	BPDocumentType,
	BPDocumentTypeOutgoing,
	BPItemV1,
	EconItemType,
	TF2ItemType,
	TF2Schema,
	TradeOfferManagerItem,
} from "./types/foreign_items.js";
import parseName from "./parsers/NameItem.js";
import parseSKU from "./parsers/SKUItem.js";
import parseEconItem from "./parsers/EconItem.js";
import parseTF2Item from "./parsers/TF2Item.js";
import parseBPDocument from "./parsers/BPDocument.js";
import parseBPURLItem from "./parsers/BPURLItem.js";
import parseItemFormatItem from "./parsers/ItemFormatItem.js";
const EPaints = importJSON("/enums/EPaints.json") as Enum;
const EStrangeParts = importJSON("/enums/EStrangeParts.json") as Enum;
const _EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;
const _ETextures = importJSON("/enums/ETextures.json") as Enum;
const _parsed_schema = importJSON("/data/parsed_schema.json") as ParsedSchema;
const _parsed_schema_names = importJSON("/data/parsed_schema_names.json") as ParsedSchema;
const _parsed_schema_norm_names = importJSON("/data/parsed_schema_norm_names.json") as ParsedSchema;
const _promos = importJSON("/data/promos.json") as NumEnum;

export const global_info = {
	ready: false,
	parsed_schema: _parsed_schema,
	parsed_schema_names: _parsed_schema_names,
	parsed_schema_norm_names: _parsed_schema_norm_names,
	promos: _promos,
	tf2_item_parser: undefined as BackpackParser | undefined,
	EUnusualEffects: _EUnusualEffects,
	ETextures: _ETextures,
	schema: undefined as TF2Schema | undefined,
};

const usables_uses: NumEnum = {
	241: 5, //dueling minigame
	233: 1, //secret saxton
	5043: 1, //wrapped gift
	5661: 1, //strangifier
	5726: 1, //killstreak kit
	9258: 1, //unusualifier
	9536: 1, //war paint
	20000: 1, //chemistry set
	20002: 1, //fabricator
};
const usables = Object.keys(usables_uses).map(u => Number(u));

export default class Item implements ItemTraits {
	def_index: number;
	quality: number;
	name: string;

	id?: string;
	craftable: boolean;
	killstreak: number;
	killstreak_sheen: number;
	killstreaker: number;
	australium: boolean;
	festivized: boolean;
	unusual: number;
	texture: number;
	wear: number;
	strange: boolean;

	tradable: boolean;
	paint: number;
	spells: number[];
	strange_parts: number[];
	usable: boolean;
	max_uses?: number;
	remaining_uses?: number;

	item_number?: number; //meaning depends on this.type
	target_def_index?: number; //def_index of item that this can be used on
	input_items?: string[]; //input items required for this item to become usable
	output_item?: {
		def_index?: number;
		quality?: number;
		item?: Item; //item resulting from the use of this item, either def_index and quality or item is defined
	};

	type: ItemType;
	needs_the: boolean;
	never_tradable: boolean; //some items are untradable now, but may become tradable later (i.e. after buying form the scm)

	img?: string;

	/**
	 * Create a new Item Instance with known item traits. Will throw an error when specifing an unknown defindex.
	 */
	constructor(traits: ItemTraits) {
		const def_index = Item.correctDefIndex(traits.def_index);
		if (def_index !== undefined) this.def_index = def_index;
		else this.def_index = -2;
		this.quality = traits.quality !== undefined ? traits.quality : default_traits.quality;
		this.name = traits.name || "";
		//@ts-ignore
		this.type = traits.type;
		//@ts-ignore
		this.needs_the = traits.needs_the;
		if (this.def_index == undefined || this.name == undefined || this.type == undefined || this.needs_the == undefined) {
			let schema_item;
			if (this.def_index != -2) schema_item = Item.getSchemaItem(this.def_index);
			else if (this.name != "") schema_item = Item.getSchemaItem(undefined, this.name);
			else throw "Bad Item!";
			if (!schema_item) {
				if (this.def_index != -1) throw "Bad Item!"; //dont throw if explicitly wildcard
			} else {
				if (this.def_index == -1) this.def_index = schema_item.def_index;
				if (this.name == "") this.name = schema_item.item_name;
				this.type = schema_item.type;
				this.needs_the = schema_item.proper_name;
				this.img = schema_item.img;
			}
		}

		this.id = traits.id;
		this.craftable = traits.craftable !== undefined ? traits.craftable : default_traits.craftable;
		this.killstreak = traits.killstreak !== undefined ? traits.killstreak : default_traits.killstreak;
		this.killstreak_sheen = traits.killstreak_sheen !== undefined ? traits.killstreak_sheen : default_traits.killstreak_sheen;
		this.killstreaker = traits.killstreaker !== undefined ? traits.killstreaker : default_traits.killstreaker;
		this.australium = traits.australium !== undefined ? traits.australium : default_traits.australium;
		this.festivized = traits.festivized !== undefined ? traits.festivized : default_traits.festivized;
		this.unusual = traits.unusual !== undefined ? traits.unusual : default_traits.unusual;
		this.texture = traits.texture !== undefined ? traits.texture : default_traits.texture;
		this.wear = traits.wear !== undefined ? traits.wear : default_traits.wear;
		this.strange = traits.strange !== undefined ? traits.strange : default_traits.strange;
		this.tradable = traits.tradable !== undefined ? traits.tradable : default_traits.tradable;
		this.paint = traits.paint !== undefined ? traits.paint : default_traits.paint;
		this.spells = traits.spells !== undefined ? traits.spells : default_traits.spells;
		this.strange_parts = traits.strange_parts !== undefined ? traits.strange_parts : default_traits.strange_parts;

		if (traits.usable) {
			this.usable = traits.usable;
			this.max_uses = traits.max_uses;
			this.remaining_uses = traits.remaining_uses;
		} else {
			const [usable, max_uses, remaining_uses] = Item.identifyUses(this.def_index, this.name, this.type);
			this.usable = usable;
			this.max_uses = max_uses;
			this.remaining_uses = remaining_uses;
		}

		this.item_number = traits.item_number;
		this.target_def_index = Item.correctDefIndex(traits.target_def_index);
		this.input_items = traits.input_items;
		this.output_item = traits.output_item;

		this.never_tradable = traits.never_tradable !== undefined ? traits.never_tradable : default_traits.never_tradable;

		if (this.australium) this.quality = EItemQuality.Strange;
		if (this.quality == EItemQuality.Strange) this.strange = true;
		if (this.texture || this.wear) this.quality = EItemQuality["Decorated Weapon"];
		else if (this.unusual) this.quality = EItemQuality.Unusual;
		if (this.never_tradable) this.tradable = false;
	}

	static async init(steam_api_key: string): Promise<void>;
	static init(schema: TF2Schema): void;
	static async init(init_value: string | TF2Schema) {
		let schema: TF2Schema;
		if (typeof init_value == "string") schema = await makeSchema(init_value);
		else schema = init_value;

		const [bschema, bschema_names, bschema_norm_names, npromos] = parseSchema(schema);
		const unu = updateUnusuals(schema.raw.schema.attribute_controlled_attached_particles);
		const tex = updateTextures(schema.raw.schema.paintkits);

		global_info.EUnusualEffects = unu;
		global_info.ETextures = tex;
		global_info.parsed_schema = bschema;
		global_info.parsed_schema_names = bschema_names;
		global_info.parsed_schema_norm_names = bschema_norm_names;
		global_info.promos = npromos;
		global_info.tf2_item_parser = new BackpackParser(schema.raw.items_game);
		global_info.schema = schema;
		global_info.ready = true;

		if (typeof init_value == "string") setTimeout(() => this.init(init_value), 1 * 60 * 60 * 1000);
	}

	static KEY = new Item({ def_index: 5021, quality: 6, name: "Mann Co. Supply Crate Key" });
	static REFINED = new Item({ def_index: 5002, quality: 6, name: "Refined Metal" });
	static RECLAIMED = new Item({ def_index: 5001, quality: 6, name: "Reclaimed Metal" });
	static SCRAP = new Item({ def_index: 5000, quality: 6, name: "Scrap Metal" });
	static FESTIVIZER = new Item({ def_index: 5839, quality: 6, craftable: false, name: "Festivizer" });
	static WILDCARD = new Item({ def_index: -1, name: "Wildcard" });

	static fromName(name: string, strict = false): Item | undefined {
		return Item.makeItem(name, parseName, strict);
	}

	static fromSKU(sku: string): Item | undefined {
		return Item.makeItem(sku, parseSKU);
	}

	/**
	 * For items from the steam api, node-steam-user and node-steamcommunity
	 */
	static fromEconItem(item: EconItemType): Item | undefined {
		return Item.makeItem(item, parseEconItem);
	}

	/**
	 * For the tf2 node module and some older bp api endpoints.
	 */
	static fromTF2(item: TF2ItemType): Item | undefined {
		return Item.makeItem(item, parseTF2Item);
	}

	/**
	 * For conversion from the tf2-item-format node module.
	 */
	static fromItemFormat(item: AllFormatAttributes): Item | undefined {
		return Item.makeItem(item, parseItemFormatItem);
	}

	/**
	 * For the newer bp api endpoints.
	 */
	static fromBPDocument(item: BPDocumentType): Item | undefined {
		return Item.makeItem(item, parseBPDocument);
	}

	static fromBPURL(url: string): Item | undefined {
		return Item.makeItem(url, parseBPURLItem);
	}

	protected static makeItem(input: any, parser: (...input: any) => ItemTraits | undefined, ...args: any[]) {
		const traits = parser(input, ...args);
		if (traits) {
			try {
				return new Item(traits);
			} catch {}
		}
	}

	static fromJSON(json: ItemTraits): Item {
		if (json.output_item?.item) {
			if (!(json.output_item.item instanceof Item)) json.output_item.item = Item.fromJSON(json.output_item.item!);
		}
		return new Item(json);
	}

	/**
	 * Compares two Items.
	 * @param item
	 * @param ignore_traits array of ETraits entries that should be ignored during the equality check.
	 */
	equal(item: Item, ignore_traits: ETraits[] = []): boolean {
		if (ignore_traits.length != 0) return this.conditionalEqual(item, ignore_traits);
		if (item.def_index == -1) return false;

		if (
			this.def_index != item.def_index ||
			this.quality != item.quality ||
			this.craftable != item.craftable ||
			this.killstreak != item.killstreak ||
			this.australium != item.australium ||
			this.festivized != item.festivized ||
			this.unusual != item.unusual ||
			this.strange != item.strange ||
			this.texture != item.texture ||
			this.wear != item.wear ||
			this.tradable != item.tradable ||
			(this.type == "supply_crate" && this.item_number != item.item_number) ||
			this.target_def_index != item.target_def_index
		) {
			return false;
		}

		const this_output = this.output_item;
		const that_output = item.output_item;
		if (Boolean(this_output) != Boolean(that_output)) return false;
		if (this_output != undefined) {
			if (this_output.def_index != that_output!.def_index || this_output.quality != that_output!.quality) return false;
			if (this_output.item && !this_output.item.equal(that_output!.item!)) return false;
		}

		const this_full_uses = !this.usable || this.remaining_uses == this.max_uses;
		const that_full_uses = !item.usable || item.remaining_uses == item.max_uses;
		if (this_full_uses != that_full_uses) {
			if (this.remaining_uses != item.remaining_uses) return false;
		}

		return true;
	}

	/**
	 * Checks if the Item is a key, ref, rec or scrap.
	 */
	isCurrency() {
		if (this.quality != 6 || !this.craftable) return false;
		const def_index = this.def_index;
		return def_index == 5021 || def_index == 5002 || def_index == 5001 || def_index == 5000;
	}

	/**
	 * Converts the Item into an easily readable String.
	 * @param include_uses Include Uses at end when required (ie. "(2/5 uses)"). Default true.
	 */
	toString(include_uses = true) {
		let final_name = this.name || String(this.def_index) || "unknown";

		const start = this.startAttributesToText();
		if (start) final_name = start + " " + final_name;

		const end = this.endAttributesToText(include_uses);
		if (end) final_name += " " + end;

		if (this.needs_the && this.quality == 6 && !this.killstreak && this.tradable) {
			if (this.craftable) final_name = "The " + final_name;
			else if (this.festivized) final_name = final_name.replace("Non-Craftable ", "Non-Craftable The "); //god knows what valve thought here
		}

		return final_name;
	}

	toSKU() {
		if (this.def_index === undefined || !this.quality) return;

		let sku = this.def_index + ";" + this.quality;
		if (this.unusual) sku += ";u" + this.unusual;
		if (this.australium) sku += ";australium";
		if (!this.craftable) sku += ";uncraftable";
		if (this.wear) sku += ";w" + this.wear;
		if (this.texture) sku += ";pk" + this.texture;
		if (this.strange && this.quality != 11) sku += ";strange";
		if (this.killstreak) sku += ";kt-" + this.killstreak;
		if (this.target_def_index) sku += ";td-" + this.target_def_index;
		if (this.festivized) sku += ";festive";
		if (this.item_number !== undefined) {
			if (this.type == "weapon" || this.type == "misc" || this.type == "tool") sku += ";n" + this.item_number;
			else if (this.type == "supply_crate") sku += ";c" + this.item_number;
		}

		const output = this.output_item;
		if (output && this.def_index != 5661) {
			if (output.def_index) sku += ";od-" + output.def_index;
			else if (output.item) sku += ";od-" + output.item.def_index;
			if (output.quality) sku += ";oq-" + output.quality;
			else if (output.item) sku += ";oq-" + output.item.quality;
		}

		return sku;
	}

	toJSON(include_defaults = false): ItemTraits {
		const json = {} as any;

		for (let k of item_traits) {
			const key = k as keyof ItemTraits;
			let value = this[key] as any;
			//@ts-ignore
			if (include_defaults || (value != undefined && default_traits[key] != value)) {
				if (key == "output_item" && this.output_item?.item) {
					value = { item: this.output_item.item.toJSON() };
				}
				json[key] = value;
			}
		}

		return json;
	}

	/**
	 * no recipes except unusualifiers and strangifiers
	 */
	toBPURL() {
		let url = "https://backpack.tf/stats/" + EItemQuality[this.quality!] + "/" + this.toBPName();
		const t = this.tradable ? "/Tradable" : "/Non-Tradable";
		const c = this.craftable ? "/Craftable" : "/Non-Craftable";
		url += t + c + "/" + (this.getBPPriceIndex(false) || "");

		return encodeURI(url);
	}
	/**
	 * The new BP Item format. Used across the new v2 api endpoints.
	 * @returns
	 */
	toBPDocument() {
		const doc: BPDocumentTypeOutgoing = {
			appid: 440,
			baseName: this.name!,
			quality: { id: this.quality! },
			craftable: this.craftable,
			tradable: this.tradable,
			priceindex: this.getBPPriceIndex(),
			killstreakTier: this.killstreak,
			sheen: this.killstreak_sheen ? { id: this.killstreak_sheen } : undefined,
			killstreaker: this.killstreaker ? { id: this.killstreaker } : undefined,
			australium: this.australium,
			festivized: this.festivized,
			quantity: this.usable ? this.remaining_uses : undefined,
			paint: this.paint ? { id: this.paint } : undefined,
			particle: this.unusual ? { id: this.unusual } : undefined,
			texture: this.texture ? { id: this.texture } : undefined,
			wearTier: this.wear ? { id: this.wear } : undefined,
			elevatedQuality: this.strange && this.quality != 11 ? { id: 11 } : undefined,
			spells: this.spells.map(s => {
				return {
					name: ESpells[s],
				};
			}),
			strangeParts: this.strange_parts.map(p => {
				return {
					killEater: {
						id: p,
					},
				};
			}),
		};

		const out = this.output_item;
		const target = this.target_def_index;
		if (out || target) {
			doc.recipe = {};
			if (out) {
				let out_item;
				if (out.def_index) out_item = new Item({ def_index: out.def_index, quality: out.quality! }).toBPDocument();
				else out_item = out.item!.toBPDocument();
				doc.recipe.outputItem = out_item;
			}
			const index = target || out?.item?.target_def_index || out?.item?.def_index;
			if (index !== undefined) {
				doc.recipe.targetItem = {
					itemName: new Item({ def_index: index }).name!,
				};
			}
		}

		return doc;
	}
	/**
	 * Specifically for the old batch create (/api/classifieds/list/v1) endpoint.
	 */
	toBPItemV1(): BPItemV1 {
		let quality: string | number = this.quality;
		if (this.strange && this.quality != EItemQuality.Strange) quality = "Strange " + EItemQuality[this.quality];

		return {
			item_name: this.toBPName(),
			quality: quality,
			craftable: this.craftable,
			priceindex: this.getBPPriceIndex(),
		};
	}
	private toBPName() {
		let final_name = this.name;
		if (this.australium) final_name = "Australium " + final_name;
		if (this.texture) final_name = global_info.ETextures[this.texture] + " " + final_name;
		if (this.killstreak) final_name = EItemKillstreak[this.killstreak] + " " + final_name;
		if (this.festivized) final_name = "Festivized " + final_name;
		if (this.wear) final_name += " (" + EItemWear[this.wear] + ")";
		return final_name;
	}
	private getBPPriceIndex(use_item_number = true) {
		let index: number | string | undefined = this.unusual || this.target_def_index || (use_item_number ? this.item_number : undefined);
		if (this.def_index == 20000) {
			const out = this.output_item;
			let out_it = out!.item!.target_def_index;
			let out_q = 11;
			if (this.quality == 14) {
				out_it = out!.item!.def_index;
				out_q = 14;
			}
			index = out_it! + "-" + out_q!;
		}

		if (index) return String(index);
		else return undefined;
	}

	toTradeOfferManagerItem(): TradeOfferManagerItem {
		if (!this.id) throw "Cannot construct TradeOfferManager item without an id: " + this.toString();
		return { assetid: this.id, appid: 440, contextid: 2 };
	}

	/**
	 * Compare all item traits, even those one would rarely check like killstreak sheen, paints and strange parts. Recommend using .equal instead.
	 */
	equalExact(item: Item, ignore_traits: ETraits[] = []) {
		if (!this.equal(item, ignore_traits)) return false;
		if (
			(this.killstreak_sheen != item.killstreak_sheen && !ignore_traits.includes(ETraits.killstreak_sheen)) ||
			(this.killstreaker != item.killstreaker && !ignore_traits.includes(ETraits.killstreaker)) ||
			(this.paint != item.paint && !ignore_traits.includes(ETraits.paint)) ||
			(this.never_tradable != item.never_tradable && !ignore_traits.includes(ETraits.never_tradable))
		) {
			return false;
		}

		if (!ignore_traits.includes(ETraits.strange_parts)) {
			const this_parts = this.strange_parts;
			const that_parts = item.strange_parts;
			if (this_parts.length != that_parts.length) return false;
			for (let part of this_parts) {
				if (!that_parts.includes(part)) return false;
			}
		}

		if (!ignore_traits.includes(ETraits.spells)) {
			const this_spells = this.spells;
			const that_spells = item.spells;
			if (this_spells.length != that_spells.length) return false;
			for (let spell of this_spells) {
				if (!that_spells.includes(spell)) return false;
			}
		}

		return true;
	}

	/**
	 * Effectively same as this.equal, but used for handling the ignore_traits parameter (this.equal does not check this parameter to avoid the overhead when using the default empty setting).
	 */
	protected conditionalEqual(item: Item, ignore_traits: ETraits[] = []) {
		if (item.def_index == -1) return false;

		if (
			(this.def_index != item.def_index && !ignore_traits.includes(ETraits.def_index)) ||
			(this.quality != item.quality && !ignore_traits.includes(ETraits.quality)) ||
			(this.craftable != item.craftable && !ignore_traits.includes(ETraits.craftable)) ||
			(this.killstreak != item.killstreak && !ignore_traits.includes(ETraits.killstreak)) ||
			(this.australium != item.australium && !ignore_traits.includes(ETraits.australium)) ||
			(this.festivized != item.festivized && !ignore_traits.includes(ETraits.festivized)) ||
			(this.unusual != item.unusual && !ignore_traits.includes(ETraits.unusual)) ||
			(this.strange != item.strange && !ignore_traits.includes(ETraits.strange)) ||
			(this.texture != item.texture && !ignore_traits.includes(ETraits.texture)) ||
			(this.wear != item.wear && !ignore_traits.includes(ETraits.wear)) ||
			(this.tradable != item.tradable && !ignore_traits.includes(ETraits.tradable)) ||
			(this.type == "supply_crate" && this.item_number != item.item_number && !ignore_traits.includes(ETraits.item_number)) ||
			(this.target_def_index != item.target_def_index && !ignore_traits.includes(ETraits.target_def_index))
		) {
			return false;
		}

		if (!ignore_traits.includes(ETraits.output_item)) {
			const this_output = this.output_item;
			const that_output = item.output_item;
			if (Boolean(this_output) != Boolean(that_output)) return false;
			if (this_output != undefined) {
				if (this_output.def_index != that_output!.def_index || this_output.quality != that_output!.quality) return false;
				if (this_output.item && !this_output.item.equal(that_output!.item!)) return false;
			}
		}

		if (!ignore_traits.includes(ETraits.usable)) {
			if (ignore_traits.includes(ETraits.remaining_uses)) {
				if (this.usable != item.usable) return false;
			} else {
				const this_full_uses = !this.usable || this.remaining_uses == this.max_uses;
				const that_full_uses = !item.usable || item.remaining_uses == item.max_uses;
				if (this_full_uses != that_full_uses) {
					if (this.remaining_uses != item.remaining_uses) return false;
				}
			}
		}

		return true;
	}

	duplicate() {
		return new Item(this.toJSON());
	}

	/**
	 * Converts the Item into an easily readable String without Name. Does not includes wear, item number or uses.
	 */
	startAttributesToText() {
		let final_name = "";
		if (!this.tradable) final_name += "Non-Tradable ";
		if (!this.craftable) final_name += "Non-Craftable ";
		if (this.strange) final_name += "Strange ";
		if (this.quality !== undefined && ![6, 11, 15].includes(this.quality!) && (this.quality != 5 || !this.unusual))
			final_name += EItemQuality[this.quality!] + " ";
		if (this.unusual) final_name += global_info.EUnusualEffects[String(this.unusual)] + " ";
		if (this.festivized) final_name += "Festivized ";
		if (this.killstreak) final_name += EItemKillstreak[this.killstreak] + " ";
		if (this.texture) final_name += global_info.ETextures[this.texture] + " ";
		if (this.australium) final_name += "Australium ";
		const out = this.output_item;
		if (out) {
			if (out.quality && out.def_index) {
				const out_item = global_info.parsed_schema[out.def_index]; //cache name in output?
				final_name += out_item?.item_name;
			} else {
				if (out.item!.def_index == 5726) {
					const out_target_item = global_info.parsed_schema[out.item!.target_def_index!];
					const out_name = out_target_item?.item_name || ""; //can be unknown in tf2 items
					final_name += out_name + " " + out.item!.name; //dont show ks or uncraftable in kit fabricator
				} else final_name += out.item!.toString();
			}
		} else if (this.target_def_index) {
			const target_def_index = this.target_def_index;
			const target_item = global_info.parsed_schema[target_def_index!];
			final_name += target_item?.item_name;
		}
		return final_name.trim();
	}

	private endAttributesToText(include_uses: boolean) {
		let final_name = "";
		if (this.wear) final_name += " (" + EItemWear[this.wear] + ")";
		if (this.type == "supply_crate" && this.item_number !== undefined) {
			final_name += " #" + this.item_number;
		}
		if (include_uses && this.usable) {
			if (this.remaining_uses! < this.max_uses!) final_name += " (" + this.remaining_uses + "/" + this.max_uses + " uses)";
		}
		return final_name.trim();
	}

	static correctDefIndex(def_index?: number) {
		if (def_index && global_info.promos[def_index] !== undefined) return global_info.promos[def_index];
		return def_index;
	}

	static identifyUses(def_index: number, name: string, type: string): [boolean, number | undefined, number | undefined] {
		let usable = false;
		let max_uses: number | undefined = undefined;
		let remaining_uses: number | undefined = undefined;

		if (usables.includes(def_index)) {
			usable = true;
			max_uses = usables_uses[def_index]!;
		} else if (type == "supply_crate") {
			if (name.includes("Keyless")) usable = true;
		} else if (type == "tool") {
			usable = true;
		} else if (type == "action") {
			usable = true;
			if (name.includes("Noise Maker") && ![536, 673, 2006].includes(def_index)) max_uses = 25;
		}

		if (usable) {
			if (max_uses == undefined) max_uses = 1;
			if (remaining_uses == undefined) remaining_uses = max_uses;
		}

		if (usable === undefined) usable = false;

		return [usable, max_uses, remaining_uses];
	}
	static getSchemaItem(def_index?: number, name?: string): ParsedSchemaEntry | undefined {
		let schema_item;
		if (def_index != undefined) schema_item = global_info.parsed_schema[def_index];
		else if (name != undefined) schema_item = global_info.parsed_schema_names[name];
		else return;
		if (!schema_item) return;

		return schema_item;
	}
}

export function normalizeName(name: string) {
	name = name.normalize("NFKD");
	name = name.toLowerCase();
	name = replaceSpecialCharacters(name);

	if (name.includes("mk")) {
		name = name.replace("mk i", "mki");
		name = name.replace("mk1", "mki");
		name = name.replace("mk 1", "mki");
		name = name.replace("mk2", "mkii");
		name = name.replace("mk 2", "mkii");
	}
	return name;
}

export function replaceSpecialCharacters(text: string) {
	text = text.normalize("NFKD");
	if (text.startsWith("taunt") || (text.startsWith("Taunt") && text.length != 5)) {
		text = text.substring(6);
		text = text.trim();
	}
	if (text.startsWith("the ") || text.startsWith("The ")) text = text.substring(4);
	text = text.trim();

	let new_text = "";
	for (let i = 0; i < text.length; i++) {
		switch (text[i]) {
			case "!":
			case "?":
			case "'":
			case ".":
			case ",":
			case "(":
			case ")":
				break;
			case "-":
			case ":":
				new_text += " ";
				break;
			default:
				new_text += text[i];
		}
	}

	new_text = new_text.replace(/\n/g, " ");
	while (new_text.includes("  ")) new_text = new_text.replace(/  /g, " "); //remove double spaces
	return new_text.trim();
}

const { parsed_schema, parsed_schema_names, parsed_schema_norm_names, promos, ETextures, EUnusualEffects } = global_info;
export { parsed_schema, parsed_schema_names, parsed_schema_norm_names, promos, ETextures, EUnusualEffects };
export { EItemKillstreak, EItemQuality, EItemWear, EKillstreaker, EKillstreakSheen, ESpells, ETraits, EPaints, EStrangeParts };
export * from "./types/foreign_items.js";
export * from "./types/index.js";
export function isReady() {
	return global_info.ready;
}
