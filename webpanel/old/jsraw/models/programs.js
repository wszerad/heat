module.export = function(){
	var turbineSpeeds=[30, 40, 50, 60, 70, 80, 90, 100];

	var parameters = {
		temp: {
			name: 'temp',
			printName: 'pokojowa',
			type: 'range',
			def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			},
			step: 1,
			min: 0,
			max: 26
		}, cycTemp: {
			name: 'cycTemp',
			printName: 'kotła',
			type: 'range',
			def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			},
			step: 1,
			min: 0,
			max: 90
		}, coTemp: {
			name: 'coTemp',
			printName: 'co',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 90
		}, helixWork: {
			name: 'helixWork',
			printName: 'czas podawania',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 240
		}, helixStop: {
			name: 'helixStop',
			printName: 'przerwa podawania',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 240
		}, helixOffStop: {
			name: 'helixOffStop', printName: 'przerwa podtrzymania', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240
		}, turbineWork: {
			name: 'turbineWork', printName: 'turbina', type: 'switch', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}
		}, turbinSpeed: {
			name: 'turbinSpeed', printName: 'prędkosc turbiny', type: 'list', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, list: turbineSpeeds
		}, cycWork: {
			name: 'cycWork', printName: 'czas pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}, cycStop: {
			name: 'cycStop', printName: 'przerwa pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}, coWork: {
			name: 'coWork', printName: 'czas pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}, coStop: {
			name: 'coStop', printName: 'przerwa pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}, cwuWork: {
			name: 'cwuWork', printName: 'czas pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}, cwuStop: {
			name: 'cwuStop', printName: 'przerwa pompy', type: 'range', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, min: 0, max: 240
		}
	};

	return parameters;
};