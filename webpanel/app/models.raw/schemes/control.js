module.exports = {
	tableName: 'control',
	attributes: {
		turbinSpeed: {
			text: 'prędkosc turbiny',
			type: 'enum',
			enum: [30, 40, 50, 60, 70, 80, 90, 100],
			category: 'nawiew',
			default: 30
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			default: false
		},
		coTemp: {
			text: 'temperatura CO',
			type: 'integer',
			category: 'CO',
			default: 0
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			default: false
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			default: 0
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			default: false
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			default: 0
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			default: false
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			default: false
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			default: 0
		},
		fuseTemp: {
			text: 'temperatura topnika',
			type: 'integer',
			category: 'topnik',
			default: 0
		},
		inside: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			default: 0
		}
	}
};
