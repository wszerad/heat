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
			default: 40,
			isParameter: true,
			PWM: true,
			pin: [6,5,4,2,1,7]
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			show: true,
			default: false,
			isParameter: true,
			pin: 9
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true,
			pin: 11
		},
		cwuCycleWork: {
			text: 'pompa obiegu CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true,
			pin: 8
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			show: true,
			default: false,
			isParameter: true,
			pin: 10
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			show: true,
			default: false,
			isParameter: true,
			pin: 12
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			show: true,
			default: false,
			isParameter: true,
			pin: 13
		},
		alert: {
			text: 'alarm',
			type: 'boolean',
			category: 'none',
			isParameter: true,
			pin: 0
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