import { BackpackParser } from "tf2-backpack";

import { Enum, ItemTraits, ItemType, item_traits, NumEnum, ParsedSchema } from "./types/index.js";
import { makeSchema, parseSchema, updateTextures, updateUnusuals } from "./lib/helpers.js";
import default_traits from "./data/default_traits.js";

import EItemKillstreak from "./enums/EItemKillstreak.js";
import EItemQuality from "./enums/EItemQuality.js";
import EItemWear from "./enums/EItemWear.js";

import ETraits from "./enums/ETraits.js";
import importJSON from "./types/importJSON.js";
import { BPDocumentTypeOutgoing, TradeOfferManagerItem } from "./types/foreign_items.js";
import ESpells from "./enums/ESpells.js";
const EUnusualEffects = importJSON("/enums/EUnusualEffects.json") as Enum;
const ETextures = importJSON("/enums/ETextures.json") as Enum;
const parsed_schema = importJSON("/data/parsed_schema.json") as ParsedSchema[];
const promos = importJSON("/data/promos.json") as NumEnum;

export const global_info = {
	ready: false,
	parsed_schema: parsed_schema,
	promos: promos,
	tf2_item_parser: undefined as BackpackParser | undefined,
	EUnusualEffects,
	ETextures,
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

export default class BaseItem implements ItemTraits {
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

	item_number?: number; //meaning depends on this.type
	target_def_index?: number; //def_index of item that this can be used on
	input_items?: string[]; //input items required for this item to become usable
	output_item?: {
		def_index?: number;
		quality?: number;
		item?: BaseItem; //item resulting from the use of this item, either def_index and quality or item is defined
	};

	type?: ItemType;
	needs_the?: boolean;
	never_tradable?: boolean; //some items are untradable now, but may become tradable later (i.e. after buying form the scm)

	parsing_done: boolean;
	parsing_failed: boolean; //if item not found in schema, unknown effect/texture etc. (safe to use once parsing_done is true)
	fully_resolved: boolean; //true once all traits have a definitve value (parsing_done is true and remaining defaults have been set)

	constructor(traits: ItemTraits) {
		//@ts-ignore
		for (let trait in traits) this[trait] = traits[trait];

		this.def_index = this.correctDefIndex(this.def_index);
		if (this.australium) this.quality = 11;
		if (this.quality == EItemQuality.Strange) this.strange = true;
		if (this.unusual) this.quality = EItemQuality.Unusual;
		if (this.texture || this.wear) this.quality = EItemQuality["Decorated Weapon"];
		if (this.never_tradable) this.tradable = false;

		this.parsing_done = true;
		this.parsing_failed = false;
		this.fully_resolved = false;
	}

	static async init(steam_api_key: string): Promise<void>;
	static init(schema: any): void;
	static async init(init_value: string | any) {
		let schema: any;
		if (typeof init_value == "string") schema = await makeSchema(init_value);
		else schema = init_value;

		const [bschema, promos] = parseSchema(schema);
		const unu = updateUnusuals(schema.raw.schema.attribute_controlled_attached_particles);
		const tex = updateTextures(schema.raw.schema.paintkits);

		global_info.EUnusualEffects = unu;
		global_info.ETextures = tex;
		global_info.parsed_schema = bschema;
		global_info.promos = promos;
		global_info.tf2_item_parser = new BackpackParser(schema.raw.items_game);
		global_info.ready = true;

		if (typeof init_value == "string") setTimeout(() => this.init(init_value), 1 * 60 * 60 * 1000);
	}

	getName() {
		return this.getAttribute("name") as string | undefined;
	}
	getDefindex() {
		return this.getAttribute("def_index") as number | undefined;
	}
	getQuality() {
		return this.getAttribute("quality") as number | undefined;
	}
	getID() {
		return this.getAttribute("id") as string | undefined;
	}
	getType() {
		return this.getAttribute("type") as ItemType;
	}
	isTradable() {
		return this.getAttribute("tradable") as boolean;
	}
	isCraftable() {
		return this.getAttribute("craftable") as boolean;
	}
	isNeverTradable() {
		return this.getAttribute("never_tradable") as boolean;
	}
	isStrange() {
		return this.getAttribute("strange") as boolean;
	}
	getKillstreak() {
		return this.getAttribute("killstreak") as number;
	}
	getKillstreakSheen() {
		return this.getAttribute("killstreak_sheen") as number;
	}
	getKillstreaker() {
		return this.getAttribute("killstreaker") as number;
	}
	isAustralium() {
		return this.getAttribute("australium") as boolean;
	}
	isFestivized() {
		return this.getAttribute("festivized") as boolean;
	}
	getUnusual() {
		return this.getAttribute("unusual") as number;
	}
	getPaint() {
		return this.getAttribute("paint") as number;
	}
	getWear() {
		return this.getAttribute("wear") as number;
	}
	getTexture() {
		return this.getAttribute("texture") as number;
	}
	getSpells() {
		return this.getAttribute("spells") as number[];
	}
	getStrangeParts() {
		return this.getAttribute("strange_parts") as number[];
	}
	isUsable() {
		return this.getAttribute("usable") as boolean;
	}
	getItemNumber() {
		return this.getAttribute("item_number") as number | undefined;
	}
	getTargetDefIndex() {
		return this.getAttribute("target_def_index") as number | undefined;
	}
	getInputItems() {
		return this.getAttribute("input_items") as BaseItem[] | undefined;
	}
	getRemainingUses() {
		return this.getAttribute("remaining_uses") as number | undefined;
	}
	getMaxUses() {
		return this.getAttribute("max_uses") as number | undefined;
	}
	getNeedsThe() {
		return this.getAttribute("needs_the") as boolean | undefined;
	}
	getOutput() {
		return this.getAttribute("output_item") as
			| {
					def_index?: number;
					quality?: number;
					item?: BaseItem;
			  }
			| undefined;
	}
	parseFailed() {
		this.fullResolve();
		return this.parsing_failed;
	}

	protected getAttribute(attribute: keyof ItemTraits) {
		if (this[attribute] === undefined) {
			if (attribute == "usable" || attribute == "remaining_uses" || attribute == "max_uses") this.identifyUses();
			else if (default_traits[attribute] !== undefined) this[attribute] = default_traits[attribute] as any;
			else if (attribute == "name" || attribute == "needs_the" || attribute == "type") this.setSchemaStats();
		}
		return this[attribute];
	}

	protected identifyUses() {
		const def_index = this.getDefindex();
		if (def_index === undefined) return;

		const name = this.getName();

		if (usables.includes(def_index)) {
			this.usable = true;
			this.max_uses = usables_uses[def_index];
		} else if (this.getType() == "supply_crate" && name?.includes("Case")) {
			this.usable = true;
			this.max_uses = 1;
		} else if (name && name.includes("Noise Maker") && ![536, 673, 2006].includes(def_index)) {
			this.usable = true;
			this.max_uses = 25;
		}
		if (this.usable) {
			if (this.max_uses == undefined) this.max_uses = 1;
			if (this.remaining_uses == undefined) this.remaining_uses = this.max_uses;
		}

		if (this.usable === undefined) this.usable = false;
	}

	setDefindex(value: number) {
		return this.setAttribute("def_index", value);
	}
	setQuality(value: number) {
		return this.setAttribute("quality", value);
	}
	setID(value?: string) {
		return this.setAttribute("id", value);
	}
	setTradable(value: boolean) {
		return this.setAttribute("tradable", value);
	}
	setCraftable(value: boolean) {
		return this.setAttribute("craftable", value);
	}
	setNeverTradable(value: boolean) {
		return this.setAttribute("never_tradable", value);
	}
	setStrange(value: boolean) {
		return this.setAttribute("strange", value);
	}
	setKillstreak(value: number) {
		return this.setAttribute("killstreak", value);
	}
	setKillstreakSheen(value: number) {
		return this.setAttribute("killstreak_sheen", value);
	}
	setKillstreaker(value: number) {
		return this.setAttribute("killstreaker", value);
	}
	setAustralium(value: boolean) {
		return this.setAttribute("australium", value);
	}
	setFestivized(value: boolean) {
		return this.setAttribute("festivized", value);
	}
	setUnusual(value: number) {
		return this.setAttribute("unusual", value);
	}
	setPaint(value: number) {
		return this.setAttribute("paint", value);
	}
	setWear(value: number) {
		return this.setAttribute("wear", value);
	}
	setTexture(value: number) {
		return this.setAttribute("texture", value);
	}
	setSpells(value: number[]) {
		return this.setAttribute("spells", value);
	}
	setStrangeParts(value: number[]) {
		return this.setAttribute("strange_parts", value);
	}
	setItemNumber(value: number) {
		return this.setAttribute("item_number", value);
	}
	setRemainingUses(value: number) {
		return this.setAttribute("remaining_uses", value);
	}

	protected setAttribute(attribute: string, value: any) {
		//@ts-ignore
		this[attribute] = value;

		switch (attribute) {
			case "australium":
				if (value) this.quality = EItemQuality.Strange;
				break;
			case "quality":
				if (value == EItemQuality.Strange) this.strange = true;
				break;
			case "unusual":
				if (value && !this.texture) this.quality = EItemQuality.Unusual;
				break;
			case "texture":
			case "wear":
				if (value) this.quality = EItemQuality["Decorated Weapon"];
				break;
			case "never_tradable":
				if (value) this.tradable = false;
				break;
			case "def_index":
				this.setSchemaStats();
				break;
		}
	}

	protected setSchemaStats() {
		const def_index = this.getDefindex();
		if (def_index == undefined) return;
		if (this.name !== undefined && this.needs_the !== undefined && this.type !== undefined) return false;

		const schema_item = global_info.parsed_schema.find(o => o.def_index == def_index);
		if (schema_item == undefined) {
			this.name = "[Unknown: " + this.def_index + "]";
			this.needs_the = false;
			this.type = "unknown";
			return;
		}

		this.name = schema_item.item_name;
		this.needs_the = schema_item.proper_name;
		this.type = schema_item.type;
	}

	/**
	 * Compares two Items.
	 * @param item
	 * @param ignore_festivized set to true to ignore the festivized attribute. Default false.
	 * @param ignore_uses set to true to ignore remainig uses attribute. Default false.
	 */
	equal(item: BaseItem, ignore_festivized: boolean = false, ignore_uses: boolean = false): boolean {
		if (this.getDefindex() === undefined) return false;
		if (
			this.getDefindex() != item.getDefindex() ||
			this.getQuality() != item.getQuality() ||
			this.isCraftable() != item.isCraftable() ||
			this.getKillstreak() != item.getKillstreak() ||
			this.isAustralium() != item.isAustralium() ||
			(!ignore_festivized && this.isFestivized() != item.isFestivized()) ||
			this.getUnusual() != item.getUnusual() ||
			this.isStrange() != item.isStrange() ||
			this.getTexture() != item.getTexture() ||
			this.getWear() != item.getWear() ||
			this.isTradable() != item.isTradable() ||
			(this.getType() == "supply_crate" && this.getItemNumber() != item.getItemNumber()) ||
			this.getTargetDefIndex() != item.getTargetDefIndex()
		) {
			return false;
		}

		const this_output = this.getOutput();
		const that_output = item.getOutput();
		if (Boolean(this_output) != Boolean(that_output)) return false;
		if (this_output != undefined) {
			if (this_output.def_index != that_output!.def_index || this_output.quality != that_output!.quality) return false;
			if (this_output.item && !this_output.item.equal(that_output!.item!)) return false;
		}

		if (!ignore_uses) {
			const this_full_uses = !this.isUsable() || this.getRemainingUses() == this.getMaxUses();
			const that_full_uses = !item.isUsable() || item.getRemainingUses() == item.getMaxUses();
			if (this_full_uses != that_full_uses) {
				if (this.getRemainingUses() != item.getRemainingUses()) return false;
			}
		}

		return true;
	}

	/**
	 * Checks if the Item is a key, ref, rec or scrap.
	 */
	isCurrency() {
		if (this.getQuality() != 6 || !this.isCraftable()) return false;
		const def_index = this.getDefindex();
		return def_index == 5021 || def_index == 5002 || def_index == 5001 || def_index == 5000;
	}

	/**
	 * Converts the Item into an easily readable String.
	 * @param include_uses Include Uses at end when required (ie. "(2/5 uses)"). Default true.
	 */
	toString(include_uses = true) {
		let final_name = this.getName() || String(this.getDefindex()) || "unknown";

		const start = this.startAttributesToText();
		if (start) final_name = start + " " + final_name;

		const end = this.endAttributesToText(include_uses);
		if (end) final_name += " " + end;

		if (this.getNeedsThe() && this.getQuality() == 6 && !this.getKillstreak() && this.isTradable()) {
			if (this.isCraftable()) final_name = "The " + final_name;
			else if (this.isFestivized()) final_name = final_name.replace("Non-Craftable ", "Non-Craftable The "); //god knows what valve thought here
		}

		return final_name;
	}

	toSKU() {
		if (this.getDefindex() === undefined || !this.getQuality()) return;

		let sku = this.getDefindex() + ";" + this.getQuality();
		if (this.getUnusual()) sku += ";u" + this.getUnusual();
		if (this.isAustralium()) sku += ";australium";
		if (!this.isCraftable()) sku += ";uncraftable";
		if (this.getWear()) sku += ";w" + this.getWear();
		if (this.getTexture()) sku += ";pk" + this.getTexture();
		if (this.isStrange() && this.getQuality() != 11) sku += ";strange";
		if (this.getKillstreak()) sku += ";kt-" + this.getKillstreak();
		if (this.getTargetDefIndex()) sku += ";td-" + this.getTargetDefIndex();
		if (this.isFestivized()) sku += ";festive";
		if (this.getItemNumber() !== undefined) {
			if (this.getType() == "weapon" || this.getType() == "misc" || this.getType() == "tool") sku += ";n" + this.getItemNumber();
			else if (this.getType() == "supply_crate") sku += ";c" + this.getItemNumber();
		}

		const output = this.getOutput();
		if (output && this.def_index != 5661) {
			if (output.def_index) sku += ";od-" + output.def_index;
			else if (output.item) sku += ";od-" + output.item.getDefindex();
			if (output.quality) sku += ";oq-" + output.quality;
			else if (output.item) sku += ";oq-" + output.item.getQuality();
		}

		return sku;
	}

	toJSON(include_defaults = false): ItemTraits {
		const json = {} as any;

		for (let k of item_traits) {
			const key = k as keyof ItemTraits;
			let value = this.getAttribute(key) as any;
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
		let url = "https://backpack.tf/stats/" + EItemQuality[this.getQuality()!] + "/" + this.toBPName();
		const t = this.isTradable() ? "/Tradable" : "/Non-Tradable";
		const c = this.isCraftable() ? "/Craftable" : "/Non-Craftable";
		url += t + c + "/" + this.getBPPriceIndex();

		return encodeURI(url);
	}
	toBPDocument() {
		const doc: BPDocumentTypeOutgoing = {
			appid: 440,
			baseName: this.getName()!,
			quality: { id: this.getQuality()! },
			craftable: this.isCraftable(),
			tradable: this.isTradable(),
			priceindex: this.getBPPriceIndex(),
			killstreakTier: this.getKillstreak(),
			sheen: this.getKillstreakSheen() ? { id: this.getKillstreakSheen() } : undefined,
			killstreaker: this.getKillstreaker() ? { id: this.getKillstreaker() } : undefined,
			australium: this.isAustralium(),
			festivized: this.isFestivized(),
			quantity: this.isUsable() ? this.getRemainingUses() : undefined,
			paint: this.getPaint() ? { id: this.getPaint() } : undefined,
			particle: this.getUnusual() ? { id: this.getUnusual() } : undefined,
			texture: this.getTexture() ? { id: this.getTexture() } : undefined,
			wearTier: this.getWear() ? { id: this.getWear() } : undefined,
			elevatedQuality: this.isStrange() && this.getQuality() != 11 ? { id: 11 } : undefined,
			spells: this.getSpells().map(s => {
				return {
					name: ESpells[s],
				};
			}),
			strangeParts: this.getStrangeParts().map(p => {
				return {
					killEater: {
						id: p,
					},
				};
			}),
		};

		const out = this.getOutput();
		const target = this.getTargetDefIndex();
		if (out || target) {
			doc.recipe = {};
			if (out) {
				let out_item;
				if (out.def_index) out_item = new BaseItem({ def_index: out.def_index, quality: out.quality! }).toBPDocument();
				else out_item = out.item!.toBPDocument();
				doc.recipe.outputItem = out_item;
			}
			const index = target || out?.item?.getTargetDefIndex() || out?.item?.getDefindex();
			if (index !== undefined) {
				doc.recipe.targetItem = {
					itemName: new BaseItem({ def_index: index }).getName()!,
				};
			}
		}

		return doc;
	}
	private toBPName() {
		let final_name = this.getName();
		if (this.isAustralium()) final_name = "Australium " + final_name;
		if (this.getTexture()) final_name = ETextures[this.getTexture()] + " " + final_name;
		if (this.getKillstreak()) final_name = EItemKillstreak[this.getKillstreak()] + " " + final_name;
		if (this.isFestivized()) final_name = "Festivized " + final_name;
		if (this.getWear()) final_name += " (" + EItemWear[this.getWear()] + ")";
		return final_name;
	}
	private getBPPriceIndex() {
		let index: number | string | undefined = this.getUnusual() || this.getTargetDefIndex() || this.getItemNumber();
		if (this.getDefindex() == 20000) {
			const out = this.getOutput();
			let out_it = out!.item!.getTargetDefIndex();
			let out_q = 11;
			if (this.getQuality() == 14) {
				out_it = out!.item!.getDefindex();
				out_q = 14;
			}
			index = out_it! + "-" + out_q!;
		}

		if (index) return String(index);
		else return undefined;
	}

	toTradeOfferManagerItem(): TradeOfferManagerItem {
		if (!this.getID()) throw "Cannot construct TradeOfferManager item without an id: " + this.toString();
		return { assetid: this.getID()!, appid: 440, contextid: 2 };
	}

	equalExact(item: BaseItem) {
		if (!this.equal(item)) return false;
		if (
			this.getKillstreakSheen() != item.getKillstreakSheen() ||
			this.getKillstreaker() != item.getKillstreaker() ||
			this.getPaint() != item.getPaint() ||
			this.isNeverTradable() != item.isNeverTradable()
		) {
			return false;
		}

		const this_parts = this.getStrangeParts();
		const that_parts = item.getStrangeParts();
		if (this_parts.length != that_parts.length) return false;
		for (let part of this_parts) {
			if (!that_parts.includes(part)) return false;
		}

		const this_spells = this.getSpells();
		const that_spells = item.getSpells();
		if (this_spells.length != that_spells.length) return false;
		for (let spell of this_spells) {
			if (!that_spells.includes(spell)) return false;
		}

		return true;
	}

	duplicate() {
		this.fullResolve();
		return new BaseItem(this.toJSON());
	}

	/**
	 * Converts the Item into an easily readable String without Name. Does not includes wear.
	 */
	startAttributesToText() {
		let final_name = "";
		if (!this.isTradable()) final_name += "Non-Tradable ";
		if (!this.isCraftable()) final_name += "Non-Craftable ";
		if (this.isStrange()) final_name += "Strange ";
		if (this.getQuality() !== undefined && ![6, 11, 15].includes(this.getQuality()!) && (this.getQuality() != 5 || !this.getUnusual()))
			final_name += EItemQuality[this.getQuality()!] + " ";
		if (this.getUnusual()) final_name += EUnusualEffects[String(this.getUnusual())] + " ";
		if (this.isFestivized()) final_name += "Festivized ";
		if (this.getKillstreak()) final_name += EItemKillstreak[this.getKillstreak()] + " ";
		if (this.getTexture()) final_name += ETextures[this.getTexture()] + " ";
		if (this.isAustralium()) final_name += "Australium ";
		const out = this.getOutput();
		if (out) {
			if (out.quality && out.def_index) {
				const out_item = global_info.parsed_schema.find(i => i.def_index == out.def_index); //cache name in output?
				final_name += out_item?.item_name;
			} else {
				if (out.item!.getDefindex() == 5726) {
					const out_target_item = global_info.parsed_schema.find(i => i.def_index == out.item!.target_def_index!);
					const out_name = out_target_item?.item_name || ""; //can be unknown in tf2 items
					final_name += out_name + " " + out.item!.getName(); //dont show ks or uncraftable in kit fabricator
				} else final_name += out.item!.toString();
			}
		} else if (this.getTargetDefIndex()) {
			const target_def_index = this.getTargetDefIndex();
			const target_item = global_info.parsed_schema.find(i => i.def_index == target_def_index);
			final_name += target_item?.item_name;
		}
		return final_name.trim();
	}

	private endAttributesToText(include_uses: boolean) {
		let final_name = "";
		if (this.getWear()) final_name += " (" + EItemWear[this.getWear()] + ")";
		if (this.getType() == "supply_crate" && this.getItemNumber() !== undefined) {
			final_name += " #" + this.getItemNumber();
		}
		if (include_uses && this.isUsable()) {
			if (this.getRemainingUses()! < this.getMaxUses()!) final_name += " (" + this.getRemainingUses() + "/" + this.getMaxUses() + " uses)";
		}
		return final_name.trim();
	}

	protected correctDefIndex(def_index?: number) {
		if (def_index && global_info.promos[def_index] !== undefined) return global_info.promos[def_index];
		return def_index;
	}

	static normalizeName(name: string) {
		name = name.normalize("NFKD");
		name = name.toLowerCase();
		name = BaseItem.replaceSpecialCharacters(name);

		if (name.includes("mk")) {
			name = name.replace("mk i", "mki");
			name = name.replace("mk1", "mki");
			name = name.replace("mk 1", "mki");
			name = name.replace("mk2", "mkii");
			name = name.replace("mk 2", "mkii");
		}
		return name;
	}

	static replaceSpecialCharacters(text: string) {
		if (text.startsWith("taunt") || text.startsWith("Taunt")) {
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

		new_text = new_text.replace("\n", " ");
		while (new_text.includes("  ")) new_text = new_text.replace(/  /g, " "); //remove double spaces
		return new_text.trim();
	}

	fullResolve() {
		if (this.fully_resolved) return;

		for (let key in default_traits) {
			//@ts-ignore
			if (this[key] === undefined) this[key] = default_traits[key];
		}
		this.setSchemaStats();

		if (!this.parsing_failed) this.parsing_failed = false;
		this.parsing_done = true;
		this.fully_resolved = true;
	}

	static unknown_traits: ETraits[] = [];
}
