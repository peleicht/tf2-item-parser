export default [
	{
		title: "Strange Specialized Killstreak Australium Axtinguisher (strange part)",
		input: {
			attribute: [
				{
					def_index: 214,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 0, 0],
					},
				},
				{
					def_index: 380,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 4, 66],
					},
				},
				{
					def_index: 542,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 128, 63],
					},
				},
				{
					def_index: 2014,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 128, 63],
					},
				},
				{
					def_index: 2022,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 0, 64],
					},
				},
				{
					def_index: 2025,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 0, 64],
					},
				},
				{
					def_index: 2027,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 128, 63],
					},
				},
			],
			equipped_state: [],
			id: "12507393354",
			account_id: 209695259,
			inventory: 3221225475,
			def_index: 38,
			quantity: 1,
			level: 1,
			quality: 11,
			flags: 4,
			origin: 20,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "11947654059",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 0,
		},
		expected_output: {
			def_index: 38,
			quality: 11,
			name: "Axtinguisher",
			id: "12507393354",
			killstreak: 2,
			killstreak_sheen: 1,
			australium: true,
			strange_parts: [33],
		},
	},
	{
		title: "Strange Festivized Specialized Killstreak Flower Power Scattergun (Well-Worn)",
		input: {
			attribute: [
				{
					def_index: 214,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [196, 0, 0, 0],
					},
				},
				{
					def_index: 725,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [205, 204, 76, 63],
					},
				},
				{
					def_index: 2014,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 224, 64],
					},
				},
				{
					def_index: 2025,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 0, 64],
					},
				},
				{
					def_index: 2053,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 128, 63],
					},
				},
			],
			equipped_state: [
				{
					new_class: 1,
					new_slot: 0,
				},
			],
			id: "8621939549",
			account_id: 209695259,
			inventory: 2147484119,
			def_index: 15107,
			quantity: 1,
			level: 1,
			quality: 15,
			flags: 4,
			origin: 8,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "4441704120",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 471,
		},
		expected_output: {
			def_index: 13,
			quality: 15,
			name: "Scattergun",
			id: "8621939549",
			killstreak: 2,
			killstreak_sheen: 7,
			festivized: true,
			texture: 72,
			wear: 4,
			strange: true,
		},
	},
	{
		title: "Noise Maker - Gremlin",
		input: {
			attribute: [],
			equipped_state: [],
			id: "12166816760",
			account_id: 209695259,
			inventory: 2147483858,
			def_index: 281,
			quantity: 18,
			level: 5,
			quality: 6,
			flags: 4,
			origin: 3,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "277292612",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 210,
		},
		expected_output: {
			def_index: 281,
			quality: 6,
			name: "Noise Maker - Gremlin",
			id: "12166816760",
			usable: true,
			max_uses: 25,
			remaining_uses: 18,
		},
	},
	{
		title: "Skill Gotten Gains Taunt: The Skating Scorcher",
		input: {
			attribute: [
				{
					def_index: 2041,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [191, 11, 0, 0],
					},
				},
			],
			equipped_state: [],
			id: "12507393115",
			account_id: 209695259,
			inventory: 3221225475,
			def_index: 30919,
			quantity: 1,
			level: 96,
			quality: 5,
			flags: 20,
			origin: 2,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "12086355330",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 0,
		},
		expected_output: {
			def_index: 30919,
			quality: 5,
			name: "Taunt: The Skating Scorcher",
			id: "12507393115",
			unusual: 3007,
		},
	},
	{
		title: "Non-Craftable Unusual Taunt: Yeti Punch Unusualifier",
		input: {
			attribute: [
				{
					def_index: 2012,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 192, 147, 68],
					},
				},
			],
			equipped_state: [],
			id: "12507264002",
			account_id: 209695259,
			inventory: 3221225475,
			def_index: 9258,
			quantity: 1,
			level: 5,
			quality: 5,
			flags: 4,
			origin: 8,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "10766031771",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 0,
		},
		expected_output: {
			def_index: 9258,
			quality: 5,
			name: "Unusualifier",
			id: "12507264002",
			craftable: false,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
			target_def_index: 1182,
		},
	},
	{
		title: "Third Degree Strangifier",
		input: {
			attribute: [
				{
					def_index: 211,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [128, 131, 182, 99],
					},
				},
			],
			equipped_state: [],
			id: "12507257164",
			account_id: 209695259,
			inventory: 3221225492,
			def_index: 5784,
			quantity: 1,
			level: 5,
			quality: 6,
			flags: 4,
			origin: 8,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "12496711903",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 0,
		},
		expected_output: {
			def_index: 5661,
			quality: 6,
			name: "Strangifier",
			id: "12507257164",
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
			target_def_index: 593,
			output_item: {
				def_index: 593,
				quality: 11,
			},
		},
	},
	{
		title: "The Patriot Peak (painted)",
		input: {
			attribute: [
				{
					def_index: 142,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [59, 181, 103, 75],
					},
				},
				{
					def_index: 261,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [59, 181, 103, 75],
					},
				},
			],
			equipped_state: [
				{
					new_class: 3,
					new_slot: 7,
				},
			],
			id: "8621939024",
			account_id: 209695259,
			inventory: 2147484193,
			def_index: 30743,
			quantity: 1,
			level: 42,
			quality: 6,
			flags: 4,
			origin: 8,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 1,
			original_id: "4479053882",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 545,
		},
		expected_output: {
			def_index: 30743,
			quality: 6,
			name: "Patriot Peak",
			id: "8621939024",
			paint: 10,
		},
	},
	{
		title: "The Sandman (spelled)",
		input: {
			attribute: [
				{
					def_index: 1009,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 128, 63],
					},
				},
			],
			equipped_state: [],
			id: "11508815507",
			account_id: 209695259,
			inventory: 2147483945,
			def_index: 44,
			quantity: 1,
			level: 15,
			quality: 6,
			flags: 4,
			origin: 0,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "3094403395",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 297,
		},
		expected_output: {
			def_index: 44,
			quality: 6,
			name: "Sandman",
			id: "11508815507",
			spells: [14],
		},
	},
	{
		title: "Nice Winter Crate 2014 #89",
		input: {
			attribute: [
				{
					def_index: 187,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 178, 66],
					},
				},
			],
			equipped_state: [],
			id: "8621938857",
			account_id: 209695259,
			inventory: 2147483852,
			def_index: 5790,
			quantity: 1,
			level: 13,
			quality: 6,
			flags: 4,
			origin: 0,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "3360557949",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 204,
		},
		expected_output: {
			def_index: 5790,
			quality: 6,
			name: "Nice Winter Crate 2014",
			id: "8621938857",
			item_number: 89,
		},
	},
	{
		title: "'Decorated War Hero' War Paint Mercenary Grade Keyless Case #113",
		input: {
			attribute: [],
			equipped_state: [],
			id: "8621944544",
			account_id: 209695259,
			inventory: 2147483651,
			def_index: 18002,
			quantity: 1,
			level: 1,
			quality: 6,
			flags: 4,
			origin: 27,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "6298849790",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 3,
		},
		expected_output: {
			def_index: 18002,
			quality: 6,
			name: "'Decorated War Hero' War Paint Mercenary Grade Keyless Case",
			id: "8621944544",
			item_number: 113,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
		},
	},
	{
		title: "Night Owl Mk.II War Paint (Factory New)",
		input: {
			attribute: [
				{
					def_index: 725,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [205, 204, 76, 62],
					},
				},
			],
			equipped_state: [],
			id: "8621940709",
			account_id: 209695259,
			inventory: 2147483857,
			def_index: 16114,
			quantity: 1,
			level: 99,
			quality: 15,
			flags: 4,
			origin: 8,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "6265888315",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 209,
		},
		expected_output: {
			def_index: 9536,
			quality: 15,
			name: "War Paint",
			id: "8621940709",
			texture: 114,
			wear: 1,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
		},
	},
	{
		title: "Non-Craftable Specialized Killstreak Batsaber Kit",
		input: {
			attribute: [
				{
					def_index: 211,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 27, 189, 99],
					},
				},
				{
					def_index: 2012,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 150, 239, 70],
					},
				},
				{
					def_index: 2014,
					value: null,
					value_bytes: {
						type: "Buffer",
						data: [0, 0, 0, 64],
					},
				},
			],
			equipped_state: [],
			id: "12525897564",
			account_id: 209695259,
			inventory: 3221225492,
			def_index: 6523,
			quantity: 1,
			level: 5,
			quality: 6,
			flags: 4,
			origin: 22,
			custom_name: null,
			custom_desc: null,
			interior_item: null,
			in_use: false,
			style: 0,
			original_id: "11110627179",
			contains_equipped_state: null,
			contains_equipped_state_v2: true,
			position: 0,
		},
		expected_output: {
			def_index: 5726,
			quality: 6,
			name: "Kit",
			id: "12525897564",
			craftable: false,
			killstreak: 2,
			killstreak_sheen: 2,
			tradable: false,
			target_def_index: 30667,
		},
	},
];
