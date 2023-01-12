//import { deepStrictEqual } from "assert";
import { parseEconItem, parseString, toSKU } from "tf2-item-format/static";
import Item from "../dist/Item.js";
import name_item_tests from "./name_item_tests.js";
import econ_item_tests from "./econ_item_tests.js";
import tf2_item_tests from "./tf2_item_tests.js";
import format_item_tests from "./format_item_tests.js";
import bp_document_item_tests from "./bp_document_item_tests.js";
import bp_api_item_tests from "./bp_api_item_tests.js";
import name_tests from "./name_tests.js";
import sku_tests from "./sku_tests.js";

/* v2:
parse everything when one thing needed
parsed schema as one hash table each for def_index and norm_item_name
more consistent output_item (just ItemAttributes?)
actually make attributes private
*/

/* const _input = "Strange Festivized Specialized Killstreak Flower Power Scattergun (Well-Worn)";

const _item = Item.fromItemName(_input);
const _item_name = _item.toString();
const _item_def_index = _item.getDefindex();
const _format_item = parseString(_input, true, true);
const _sku = _item.toSKU();
const _itt = Item.fromSKU(_sku);
const _sku_name = _itt.toString();
let x; */

/**
 * Cases that need to be handled:
 * Basic attributes (craftable, killstreak, australium, festivized, elevated strange, tradable)
 * Numberic attributs (unusual, texture, paint, spells)
 * Usable items (max_uses, remaining_uses)
 * 'Special' Items: Crates, Cases, Unusualifiers, Killstreak Kit (Fabricators), Chemistry Sets, Strangifiers, War Paints, Gift-wrapped items, multiple def_indexes
 *
 * missing: medal, key uses
 *
 * In practice: [
 * 	Strange Specialized Killstreak Australium Axtinguisher,
 * 	Strange Festivized Specialized Killstreak Flower Power Scattergun (Well-Worn),
 * 	Noise Maker - Gremlin,
 * 	Non-Tradable Bonk Boy,
 * 	Skill Gotten Gains Taunt: The Skating Scorcher,
 * 	Non-Craftable Unusual Taunt: Yeti Punch Unusualifier,
 * 	Foppish Physician Strangifier Chemistry Set Series #2,
 * 	Third Degree Strangifier,
 * 	The Patriot Peak (painted),
 * 	The Sandman (spelled),
 * 	Nice Winter Crate 2014 #89,
 * 	'Decorated War Hero' War Paint Mercenary Grade Keyless Case #113,
 * 	Night Owl Mk.II War Paint (Factory New),
 * 	A Carefully Wrapped Gift,
 * 	Non-Craftable Killstreak Enforcer Kit,
 * 	Specialized Killstreak Mantreads Kit Fabricator
 * ]
 *
 * todo:
 */

doTests();
async function doTests() {
	await Item.init("2DFB813179B47E85D649D24B59E4CDBC");
	console.log("Initilization of Item Class successfull.");

	let successes = 0;
	let total = 0;

	console.log("Item.fromName()");
	test(name_item_tests, Item.fromItemName, "input");

	console.log("Item.fromEconItem()");
	test(econ_item_tests, Item.fromEconItem);

	console.log("Item.fromTF2()");
	test(tf2_item_tests, Item.fromTF2);
	console.log("Item.fromTF2() (BP Items)");
	test(bp_api_item_tests, Item.fromTF2);

	console.log("Item.fromItemFormat()");
	test(format_item_tests, Item.fromItemFormat);

	console.log("Item.fromBPDocument()");
	test(bp_document_item_tests, Item.fromBPDocument);

	console.log("Item.toString()");
	test(name_tests, Item.toString, "expected_output", "json-string", "none");

	console.log("Item.toSKU()");
	test(sku_tests, Item.toSKU, "title", "json-sku", "none");

	console.log("\nSucceeded with " + successes + "/" + total + " tests.");

	function test(tests, func, title = "title", input_parse = "func", output_parse = "json") {
		let stop_at = 13;
		let i = 0;

		for (let test of tests) {
			let success = false;
			const test_title = test[title];

			try {
				const input = parseItem(test.input, input_parse);
				const output = parseItem(test.expected_output, output_parse);
				if (typeof input == "object") success = input.equalExact(output);
				else success = input == output;

				if (!success || stop_at <= i) {
					let n = input.toString();
					let x;
				}
			} catch (err) {
				console.log("Error during " + test_title + ": " + err);
				if (err.stack) console.log(err.stack);
			}

			if (success) {
				console.log("	✅ " + test_title);
				successes++;
			} else console.log("	❌ " + test_title);
			total++;

			i++;
		}

		function parseItem(def, type) {
			switch (type) {
				case "func":
					return func(def);
				case "json":
					return Item.fromJSON(def);
				case "json-string":
					return Item.fromJSON(def).toString();
				case "json-sku":
					return Item.fromJSON(def).toSKU();
				case "none":
					return def;
			}
		}
	}
}
