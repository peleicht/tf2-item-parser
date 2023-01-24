import Item from "../dist/Item.js";
import name_item_tests from "./name_item_tests.js";
import econ_item_tests from "./econ_item_tests.js";
import tf2_item_tests from "./tf2_item_tests.js";
import format_item_tests from "./format_item_tests.js";
import bp_document_item_tests from "./bp_document_item_tests.js";
import bp_api_item_tests from "./bp_api_item_tests.js";
import name_tests from "./name_tests.js";
import sku_tests from "./sku_tests.js";

/* todo:
more consistent output_item (just ItemAttributes?)
save schema (allow parsing tf2 items without init)
*/

doTests();
async function doTests() {
	await Item.init("2DFB813179B47E85D649D24B59E4CDBC");
	console.log("Initilization of Item Class successfull.\n");

	let successes = 0;
	let total = 0;

	console.log("Item.fromName()");
	test(name_item_tests, Item.fromName, "input");

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
		let stop_at = 5;
		let i = 0;

		for (let test of tests) {
			let success = false;
			const test_title = test[title];

			try {
				if (stop_at <= i) {
					let x;
				}

				const input = parseItem(test.input, input_parse);
				const output = parseItem(test.expected_output, output_parse);
				if (typeof input == "object") success = input.equalExact(output);
				else success = input == output;
				let x;
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
