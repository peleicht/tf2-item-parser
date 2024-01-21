# TF2 Item Parser

Simple-to-use parser for TF2 items. Fully typed and lighting fast.

Provides a unified interface for items, which allows parsing from and to largely any format you might come across:

- Item names
- SKU
- EconItem (steam api, node-steam-user and node-steamcommunity)
- TF2 (node-tf2, GC and backpack.tf api)
- Backpack Documents (old and new backpack.tf api)
- Backpack.tf URLs
- Attribute objects (tf2-item-format)

No longer must we suffer from too many item formats

## Installation

```bash
npm install tf2-item-parser
```

## Basic Usage

```js
import Item from "tf2-item-parser";

const item = Item.fromName("Strange Professional Killstreak Australium Rocket Launcher");

console.log(item.toSKU()); // 18;11;australium;kt-3
console.log(item.toString()); // Strange Professional Killstreak Australium Rocket Launcher
```

### Initialization

This module relies on preprocessed item definitions to efficiently parse items. These come already bundled with the module, but can be updated by calling the init method.

It is not strictly required to call this method since most methods will function without it, but it is needed to parse new items following tf2 updates. Generally, I recommend calling this method once on startup.

If you do not call this method, the following will not be available: _Item.fromTF2_ and _global_info.schema_.

You can also use an instance of tf2-schema for initialization. When providing an api key, _init_ will automatically call itself every few hours, so you will not need to call it again.

```js
import Item from "tf2-item-parser";

await Item.init(""); // Steam API Key
```

## Documentation

## Item

The main Item class.

Create with _Item.fromX_. Compare with _.equal(item)_. Convert with _.toX_.

## Properties

- _name_: The item's base name.
- _def_index_: The item's definition index.
- _quality_: number. The item's quality as a number (see EItemQuality).
- _id?_: The item's id.
- _craftable_: Whether the item is craftable.
- _killstreak_: The item's killstreak tier (see EKillstreakTier).
- _killstreak_sheen_: The item's killstreak sheen (see EKillstreakSheen).
- _killstreaker_: The item's killstreaker (see EKillstreaker).
- _australium_: Whether the item is australium.
- _festivized_: Whether the item is festivized.
- _unusual_: The item's unusual effect (see EUnusualEffects).
- _texture_: The item's texture (see ETexture).
- _wear_: The item's wear (see EWear).
- _strange_: Whether the item is strange.
- _tradable_: Whether the item is tradable.
- _paint_: The item's paint (see EPaints).
- _spells_: List of the item's spells (see ESpells).
- _strange_parts_: List of the item's strange parts (see EStrangeParts).
- _usable_: Whether the item is usable.
- _max_uses?_: The item's max uses. Specified for usable items.
- _remaining_uses?_: The item's remaining uses. Specified for usable items.
- _item_number?_: The item's item number. Meaning depends on the item's type, one of: craft number, crate number, chemistry set series, medal number
- _target_def_index?_: def_index of item that this can be used on (for killstreak kits, strangifiers, etc)
- _input_items?_: List of items (as strings) that are required to craft this item.
- _output_item?_: Item received when crafting this item. Specifies .def_index and .quality for Strangifiers. Specifies .item for Chemistry Sets, Kit Fabricators and Wrapped Gifts.
  - _def_index?_: The item's definition index.
  - _quality?_: number. The item's quality as a number (see EItemQuality).
  - _item?_: A Item instance indicating the item received when using this item.
- _type_: The item's type (see ItemType).
- _needs_the_: Whether the item needs "The" in front of its name.
- _never_tradable_: Whether the item is never tradable (as opposed to not currently tradable).

## Static Methods

### new Item(item: ItemTraits)

Create a new item directly from known item traits.

### init(init_value?: string | Schema)

Initialize the item parser with a Steam API Key or a tf2-schema instance.

### fromName(name: string): Item | undefined

Parses an item from a string. Ignores case and special characters. Will return undefined if the string is not a valid item.

### fromSKU(sku: string): Item | undefined

Parses an item from a SKU.

### fromEconItem(item: EconItem): Item | undefined

Parses an item from the steam api, node-steam-user and node-steamcommunity.

### fromTF2(item: TF2Item): Item | undefined

Parses an item from the node-tf2 module and older backpack.tf api endpoints (including snapshots).

### fromBPDocument(item: BPDocumentType): Item | undefined

Parses an item from newer backpack.tf api endpoints (websocket, /v2).

### fromBPUrl(url: string): Item | undefined

Parses an item from a URL to a backpack.tf "stats" page (https://backpack.tf/stats/...).

### fromItemFormat(item: AllFormatAttributes): Item | undefined

Parses an item from a tf2-item-format attribute object.

### fromJSON(json: ItemTraits): Item | undefined

Creates an Item from an ItemTraits object. Useful for converting an Item back after using _.toJSON_.

### normalizeDefIndex(def_index?: number): number | undefined

Some Items have several possible def_index values depending on quality, style or obtain method. This method returns the lowest possible def_index for the item.

## Methods

### equal(item: Item, ignore_traits: ETraits[] = []): boolean

Compares two Items.

Only compares traits that meaningfully differentiate items (i.e. ignores paint, killstreak sheens, killstreakers, strange parts and spells).
Use .equalExact to compare all traits.

### toString(): string

Converts the Item to its fully qualified name. Includes name, quality, killstreak, etc.

### toSKU(): string

Converts the Item to a SKU. Equivalent to the widely used Marketplace.tf SKU.

Note that the backpack.tf api usually expects a name (use _toString_) when using the sku parameter.

### toJSON(): ItemTraits

Converts the Item to JSON. Useful for saving items to a database or file.

Convert them back to items using _fromJSON_.

### toBPURL(): string

Obtains the URL to the item on backpack.tf.

### toBPDocument(): BPDocumentType

Converts the item to the new backpack.tf item format. Used across the new v2 api endpoints.

### toBPItemV1(): BPItemV1

Converts the item to an item for the old backpack.tf api endpoints.

### toTradeOfferManagerItem(): TradeOfferManagerItem

Creates a TradeOfferManager item from the Item. Used for sending trade offers using steam-tradeoffer-manager.

### isCurrency(): boolean

Checks if the Item is a key, ref, rec or scrap.

### duplicate(): Item

Duplicate the Item. Useful for creating a copy of an item that can be modified without affecting the original.

## Other exports of note

### global_info

Holds various internal objects used by the module, including a reference to the tf2-schema instance used for parsing.

### Various Enums

- EItemQuality
- EItemKillstreak
- EKillstreakSheen
- EKillstreaker
- EUnusualEffects
- ETexture
- EWear
- EPaints
- ESpells
- EStrangeParts
- ETraits (for ignore_traits parameter of .equal)

### Various types

- Various types

## License

MIT
