module.exports = {
	tableName: 'command',
	attributes: {
		id: {
			text: 'ID',
			type: 'increments',
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
			enum: [30, 40, 50, 60, 70, 80, 90, 100],
			category: 'nawiew',
			show: true,
			default: 30
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			show: true,
			default: false
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			show: true,
			default: false
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			show: true,
			default: false
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			show: true,
			default: false
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