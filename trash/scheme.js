var Parser = require('fixedline');


new Parser({
	time: {
		type: String,
		size: 19
	},
	owner: {
		type: String,
		size: 8
	},
	ownerLevel: {
		type: Number,
		size: 1
	},
	units: {
		type: [{
			type: Boolean,
			size: 6
		}],
		size: this.units.length
	},
	sensors: {
		type: [{
			type: Number,
			size: 4
		}],
		size: this.sensors.length
	}
});