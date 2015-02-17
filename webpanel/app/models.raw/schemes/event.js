module.exports = {
	tableName: 'events',
	attributes: {
		id: {
			text: 'ID', type: 'increments', default: null
		},
		schedule_id: {
			type: 'integer',
			notNull: true
		},
		program_id: {
			type: 'integer',
			notNull: true
		},
		start: {
			type: 'integer',
			notNull: true
		},
		day: {
			type: 'integer',
			notNull: true
		}
	}
};