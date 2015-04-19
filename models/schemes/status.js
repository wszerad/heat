module.exports = {
	tableName: 'status',
	attributes: {
		coTemp: {
			text: 'temperatura CO',
			type: 'integer',
			category: 'CO',
			show: true,
			default: 0,
			pin: 5,
      fix: 15
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			show: true,
			default: 0,
			pin: 6,
      fix: 4
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			show: true,
			default: 0,
			pin: 4,
      fix: 6
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			show: true,
			default: 0,
			pin: 3,
      fix: -6
		},
		insideTemp: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			show: true,
			default: 0,
			pin: 7,
      fix: 17
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
		},
		timeout: {
			text: 'timeout',
			type: 'timestamp',
			category: 'none'
		},
		type: {
			text: 'typ',
			type: 'string',
			category: 'none'
		}
	}
};
