module.exports = {
	tableName: 'schedules',
	attributes: {
		id: {
			text: 'ID', type: 'increments', default: null
		},
		name: {
			text: 'nazwa', type: 'string', unique: true, default: ''
		},
		basic: {
			text: 'podstawowy',
			type: 'boolean',
			default: false
		},
		active: {
			text: 'aktywny',
			type: 'boolean',
			default: false
		}
	}
};