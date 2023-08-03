import EItemKillstreak from "../enums/EItemKillstreak.js";
import ETraits from "../enums/ETraits.js";
import Item from "../Item.js";
import { Enum, ItemTraits } from "../types/index.js";

import importJSON from "../types/importJSON.js";
import { BPDocumentType } from "../types/foreign_items.js";
import ESpells from "../enums/ESpells.js";
import EItemQuality from "../enums/EItemQuality.js";
const EPaints = importJSON("/enums/EPaints.json") as Enum;

export default function parseBPDocument(item: BPDocumentType): ItemTraits | undefined {
	if (item.appid !== undefined && item.appid != 440) return;

	const traits: ItemTraits = {};

	traits.def_index = Item.correctDefIndex(item.defindex);
	traits.name = item.baseName;
	const schema_item = Item.getSchemaItem(traits.def_index!, traits.name!);
	if (schema_item) {
		traits.name = schema_item.item_name;
		traits.type = schema_item.type;
		traits.needs_the = schema_item.proper_name;
	}

	traits.quality = item.quality.id;
	if (item.id) traits.id = item.id;
	traits.craftable = item.craftable || false;
	traits.tradable = item.tradable;

	if (item.killstreakTier) traits.killstreak = item.killstreakTier;
	if (item.killstreaker) traits.killstreaker = item.killstreaker.id;
	if (item.sheen) traits.killstreak_sheen = item.sheen.id;

	traits.australium = item.australium;
	if (traits.australium) traits.quality = EItemQuality.Strange;
	traits.festivized = item.festivized;
	if (item.particle) {
		traits.unusual = item.particle.id;
		traits.quality = EItemQuality.Unusual;
	}
	if (item.texture) {
		traits.texture = item.texture.id;
		traits.quality = EItemQuality["Decorated Weapon"];
	}
	if (item.wearTier) {
		traits.wear = item.wearTier.id;
		traits.quality = EItemQuality["Decorated Weapon"];
	}
	traits.strange = Boolean(item.elevatedQuality) || traits.quality == EItemQuality.Strange;

	if (item.paint) traits.paint = EPaints[item.paint.name] as number;

	if (item.spells) {
		traits.spells = [];
		for (let spell of item.spells) {
			//@ts-ignore
			traits.spells.push(ESpells[spell.name]);
		}
	}

	if (item.strangeParts) {
		traits.strange_parts = [];
		for (let part of item.strangeParts) {
			traits.strange_parts.push(part.killEater.id);
		}
	}

	const [usable, max_uses, remaining_uses] = Item.identifyUses(traits.def_index!, traits.name!, traits.type!)!;
	traits.usable = usable;
	traits.max_uses = max_uses;
	if (usable && item.quantity) traits.remaining_uses = Number(item.quantity);
	else traits.remaining_uses = remaining_uses;

	traits.item_number = item.crateSeries;

	if (item.recipe && item.recipe.targetItem) {
		if (item.recipe.targetItem) {
			if (traits.def_index != 20000) traits.target_def_index = item.recipe?.targetItem?._source.defindex;

			if (traits.def_index == 5661) {
				//strangifier
				traits.output_item = {
					def_index: traits.target_def_index,
					quality: 11,
				};
			} else if (traits.def_index == 20002) {
				//killstreak kit fabricator
				if (item.recipe?.outputItem) {
					traits.output_item = {
						item: new Item({
							def_index: 5726,
							quality: 6,
							name: "Kit",
							craftable: false,
							killstreak:
								item.recipe.outputItem.defindex == 20002 ? EItemKillstreak["Specialized Killstreak"] : EItemKillstreak["Professional Killstreak"],
							killstreak_sheen: traits.killstreak_sheen,
							killstreaker: traits.killstreaker,
							target_def_index: traits.target_def_index,
						}),
					};
					traits.killstreak = traits.output_item.item!.killstreak;
					traits.killstreak_sheen = traits.output_item.item!.killstreak_sheen;
					traits.killstreaker = traits.output_item.item!.killstreaker;
				} else {
					traits.output_item = {
						item: undefined,
					};
				}
			}
		}

		if (item.recipe.inputItems) {
			traits.input_items = [];
			for (let input of item.recipe.inputItems) {
				const ins = new Array(input.quantity).fill(input.name);
				traits.input_items = traits.input_items!.concat(ins);
			}
		}

		if (item.recipe.outputItem) {
			if (!traits.output_item) traits.output_item = {};

			if (traits.def_index == 20000) {
				//collectors/strangifier chemistry set
				if (traits.quality == 14) {
					if (item.recipe?.outputItem) {
						traits.output_item = {
							item: new Item({
								def_index: item.recipe.outputItem.defindex,
								quality: 14,
							}),
						};
					} else {
						traits.output_item = {
							item: undefined,
						};
					}
					traits.item_number = 3;
				} else {
					if (item.recipe.targetItem) {
						traits.output_item = {
							item: new Item({
								def_index: 5661,
								quality: 6,
								name: "Strangifier",
								target_def_index: item.recipe.targetItem._source.defindex,
							}),
						};
					}
					traits.item_number = 2;
				}
			}
		}
	}

	if (item.containedItem) {
		//traits in here seem unreliable, so just use name
		traits.output_item = {
			item: Item.fromName(item.containedItem.name),
		};
	}

	return traits;
}

export const unknown_traits: ETraits[] = [ETraits.never_tradable];
