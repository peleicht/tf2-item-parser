export default [
	{
		input: {
			def_index: 38,
			quality: 11,
			name: "Axtinguisher",
			killstreak: 2,
			australium: true,
		},
		expected_output: "Strange Specialized Killstreak Australium Axtinguisher",
	},
	{
		input: {
			def_index: 13,
			quality: 15,
			name: "Scattergun",
			killstreak: 2,
			festivized: true,
			texture: 72,
			wear: 4,
			strange: true,
		},
		expected_output: "Strange Festivized Specialized Killstreak Flower Power Scattergun (Well-Worn)",
	},
	{
		input: {
			def_index: 281,
			quality: 6,
			name: "Noise Maker - Gremlin",
			usable: true,
			max_uses: 25,
			remaining_uses: 18,
		},
		expected_output: "Noise Maker - Gremlin (18/25 uses)",
	},
	{
		input: {
			def_index: 451,
			quality: 6,
			name: "Bonk Boy",
			tradable: false,
		},
		expected_output: "Non-Tradable Bonk Boy",
	},
	{
		input: {
			def_index: 30919,
			quality: 5,
			name: "Taunt: The Skating Scorcher",
			unusual: 3007,
		},
		expected_output: "Skill Gotten Gains Taunt: The Skating Scorcher",
	},
	{
		input: {
			def_index: 9258,
			quality: 5,
			name: "Unusualifier",
			craftable: false,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
			target_def_index: 1182,
		},
		expected_output: "Non-Craftable Unusual Taunt: Yeti Punch Unusualifier",
	},
	{
		input: {
			def_index: 20000,
			quality: 6,
			name: "Chemistry Set",
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
			item_number: 2,
			output_item: {
				item: {
					def_index: 5661,
					quality: 6,
					name: "Strangifier",
					usable: true,
					max_uses: 1,
					remaining_uses: 1,
					target_def_index: 878,
				},
			},
		},
		expected_output: "Foppish Physician Strangifier Chemistry Set",
	},
	{
		input: {
			def_index: 5661,
			quality: 6,
			name: "Strangifier",
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
			target_def_index: 593,
			output_item: {
				def_index: 593,
				quality: 11,
			},
		},
		expected_output: "Third Degree Strangifier",
	},
	{
		input: {
			def_index: 5790,
			quality: 6,
			name: "Nice Winter Crate 2014",
			item_number: 89,
		},
		expected_output: "Nice Winter Crate 2014 #89",
	},
	{
		input: {
			def_index: 18002,
			quality: 6,
			name: "'Decorated War Hero' War Paint Mercenary Grade Keyless Case",
			item_number: 113,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
		},
		expected_output: "'Decorated War Hero' War Paint Mercenary Grade Keyless Case #113",
	},
	{
		input: {
			def_index: 9536,
			quality: 15,
			name: "War Paint",
			texture: 114,
			wear: 1,
			usable: true,
			max_uses: 1,
			remaining_uses: 1,
		},
		expected_output: "Night Owl Mk.II War Paint (Factory New)",
	},
	{
		input: {
			def_index: 5726,
			quality: 6,
			name: "Kit",
			craftable: false,
			killstreak: 1,
			target_def_index: 460,
		},
		expected_output: "Non-Craftable Killstreak Enforcer Kit",
	},
	{
		input: {
			def_index: 20002,
			quality: 6,
			name: "Fabricator",
			killstreak: 2,
			target_def_index: 444,
			output_item: {
				item: {
					def_index: 5726,
					quality: 6,
					name: "Kit",
					craftable: false,
					killstreak: 2,
					target_def_index: 444,
				},
			},
		},
		expected_output: "Specialized Killstreak Mantreads Kit Fabricator",
	},
];
