module.exports = {
	tableName: 'logs',
	attributes: {
		label: {
			text: 'label', type: 'string', default: ''
		},
		level: {
			text: 'level', type: 'string', default: ''
		},
		message: {
			text: 'wiadomosc', type: 'string', default: ''
		},
		meta: {
			text: 'meta', type: 'string', default: 0
		},
		timestamp: {
			text: 'czas', type: 'timestamp', default: function(){return new Date()}
		}
	}
};