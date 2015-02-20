module.exports = {
	tableName: 'programs',
	attributes: {
		id: {
			text: 'ID', type: 'increments', editable: false, category: 'Podstawowe', default: null
		},
		name: {
			text: 'nazwa', type: 'string', unique: true, category: 'Podstawowe', default: '', editable: true
		},
		basic: {
			text: 'podstawowy', type: 'boolean', def: {
				day: true, night: true, water: true, standby: true, stop: true
			}, editable: false, category: 'Podstawowe', default: false
		},
		temp: {
			text: 'zadana', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 26, category: 'Temperatura', default: 0, editable: true
		}, cycTemp: {
			text: 'temp. kotła', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true
		}, coTemp: {
			text: 'temp. CO', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true
		}, helixWork: {
			text: 'czas podawania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, helixStop: {
			text: 'przerwa podawania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, helixOffStop: {
			text: 'przerwa podtrzymania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, turbineWork: {
			text: 'turbina', type: 'boolean', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, category: 'Nawiew', default: true, editable: true
		}, turbinSpeed: {
			text: 'prędkosc turbiny', type: 'enum', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, enum: [30, 40, 50, 60, 70, 80, 90, 100], category: 'Nawiew', default: 30, editable: true
		}, cycWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true
		}, cycStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true
		}, coWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true
		}, coStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true
		}, cwuWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true
		}, cwuStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true
		}
	}
};