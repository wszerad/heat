module.exports = {
	tableName: 'command',
	attributes: {
		id: {
			text: 'ID',
			type: 'string',
			category: 'none'
		},
		owner: {
			text: 'moduł',
			type: 'string',
			category: 'none'
		},
		level: {
			text: 'poziom',
			type: 'integer',
			category: 'none'
		},
		turbineSpeed: {
			text: 'prędkosc turbiny',
			type: 'enum',
			enum: [0, 20, 40, 60, 80, 100],
			category: 'nawiew',
			show: true,
			default: 30,
			isParameter: true,
			PWM: true
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			show: true,
			default: false,
			isParameter: true
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true
		},
		cwuCycleWork: {
			text: 'pompa obiegu CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			show: true,
			default: false,
			isParameter: true
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			show: true,
			default: false,
			isParameter: true
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			show: true,
			default: false,
			isParameter: true
		},
		alert: {
			text: 'podajnik',
			type: 'boolean',
			category: 'none',
			isParameter: true
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