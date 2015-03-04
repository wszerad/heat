module.exports = {
	tableName: 'logs',
	attributes: {
		label: {
			text: 'etykieta', type: 'string', default: ''
		},
		level: {
			text: 'poziom', type: 'string', default: ''
		},
		message: {
			text: 'wiadomosc', type: 'string', default: ''
		},
		meta: {
			text: 'meta', type: 'string', default: 0
		},
		timestamp: {
			text: 'czas', type: 'timestamp', default: function(){
				return new Date();
			}
		}
	}
};