module.exports = {
	tableName: 'status',
	attributes: {
		coTemp: {
			text: 'temperatura CO',
			type: 'integer',
			category: 'CO',
			show: true,
			default: 0
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			show: true,
			default: 0
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			show: true,
			default: 0
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			show: true,
			default: 0
		},
		fuseTemp: {
			text: 'temperatura topnika',
			type: 'integer',
			category: 'topnik',
			show: true,
			default: 0
		},
		insideTemp: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			show: true,
			default: 0
		},
		m: {
			text: 'minute',
			type: 'integer',
			category: 'none'
		},
		time: {
			text: 'data',
			type: 'timestamp',
			category: 'none'
		}
	}
};
