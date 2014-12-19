var App = angular.module('app', []);


//<editor-fold desc="Tabber">
App.provider('tabber', function(){
	var tab = 1;

	this.$get = function(){
		return {
			getTab: function(){
				return tab;
			},
			setTab: function(nr){
				tab = nr;
			}
		};
	};
});

App.controller('tabs', ['$scope', 'tabber', function($scope, tabber){
	$scope.tab = 1;

	$scope.change = function(nr){
		tabber.setTab(nr);
		$scope.tab = nr;
	};
}]);
//</editor-fold>

App.controller('programs', ['$scope', '$http', function($scope, $http){
	$scope.init = function(){};

	$scope.programs = [];
	$scope.program = {

	};

	$scope.selectProgram = function(nr){

	};
}]);


App.factory('programCollection', [function(){
	var programs = [
		{
			name: 'temp',
			printName: 'pokojowa',
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
			max: 26
		},
		{
			name: 'cycTemp',
			printName: 'kotła',
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
		},
		{
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
		},
		{
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
		},
		{
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
		},
		{
			name: 'helixOffStop',
			printName: 'przerwa podtrzymania',
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
		},
		{
			name: 'turbineWork',
			printName: 'turbina',
			type: 'switch',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			}
		},
		{
			name: 'turbinSpeed',
			printName: 'prędkosc turbiny',
			type: 'list',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			list: turbineSpeeds
		},
		{
			name: 'cycWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cycStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'coWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'coStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cwuWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cwuStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		}
	];
}]);

App.provider('programs', function(){
	var programs = [],
		colors = [];

	this.$get = function(){
		return {
			getById: function(id){
				return programs.find(function(ele){
					return (ele.id == id);
				});
			},
			getByName: function(name){
				return programs.find(function(ele){
					return (ele.name == name);
				});
			},
			addProgram: function(program){
				programs.push(program);
				colors.push(0);

				var step = 360/colors.length;
				for(var i=0; i<colors.length; i++){
					colors[i] = i*step;
				}
			},
			setPrograms: function(progs){
				programs = progs;

				var step = 360/colors.length;
				for(var i=0; i<colors.length; i++){
					colors[i] = i*step;
				}
			},
			getNames: function(){
				return programs.map(function(ele){return ele.name;})
			}
		};
	};
});

//<editor-fold desc="Schedule">
App.controller('scheduler', ['$scope', '$http', function($scope, $http){
	var events = [];

	$scope.days = [
		{
			name: 'Poniedziałek',
			events: [],
			val: 0
		},
		{
			name: 'Wtorek',
			events: [],
			val: 1
		},
		{
			name: 'Środa',
			events: [],
			val: 2
		},
		{
			name: 'Czwartek',
			events: [],
			val: 3
		},
		{
			name: 'Piątek',
			events: [],
			val: 4
		},
		{
			name: 'Sobota',
			events: [],
			val: 5
		},
		{
			name: 'Niedziela',
			events: [],
			val: 6
		}
	];

	$scope.startDay = $scope.days[0];
	$scope.endDay = $scope.days[6];
	$scope.startTime = null;
	$scope.endTime = null;

	$scope.addEvent = function(){
		//$http.put('/schedule/add', {params: {

		//}})

		var e = {start: 0, end: 10080},
			dayMin = 1440,
			startDay = Math.floor(e.start/dayMin),
			endDay = Math.floor(e.end/dayMin),
			startMin = e.start%dayMin,
			endMin = e.end%dayMin,
			height, top, i;

		for(i=startDay; i<=endDay; i++){
			if(startDay===endDay){
				height = ((endMin-startMin)/dayMin*100);
				top = (startMin/dayMin*100);

				$scope.days[i].events.push({
					link: e,
					style: {'height': height+'%', 'top': top+'%'}
				});
			}else if(i===startDay){
				top = (startMin/dayMin*100);

				$scope.days[i].events.push({
					link: e,
					style: {height: (100-top)+'%', top: top+'%'}
				});
			}else if(i===endDay){
				height = (endMin/dayMin*100);

				$scope.days[i].events.push({
					link: e,
					style: {height: height+'%', top: 0}
				});
			}else{
				$scope.days[i].events.push({
					link: e,
					style: {'height': '100%', top: 0}
				});
			}
		}

	}
}]);
//</editor-fold>

//<editor-fold desc="Debugger">
App.controller('debugger', ['$scope', '$http', '$interval', 'tabber', function($scope, $http, $interval, tabber){
	var updater = function(){
		$http.get('/log/cat').
			success(function(data){
				$scope.modules = [{type: 'all', name: 'Wszystkie'}];
				data.modules.forEach(function(row){
					$scope.modules.push({type: row.label, name: row.label});
				});

				$scope.filters = [{type: 'all', name: 'Brak'}];
				data.filters.forEach(function(row){
					$scope.filters.push({type: row.label, name: row.level});
				});
			});
	};

	$scope.data = [];

	$scope.init = function(){
		updater();
		$scope.search();
	};

	$scope.update = function(){
		updater();
	};

	$scope.modules = [
		{name: 'Wszystkie', type: 'all'}
	];
	$scope.module = $scope.modules[0];

	$scope.filters = [
		{name: 'Brak', type: 'all'}
	];
	$scope.filter = $scope.filters[0];

	$scope.pickModule = function(nr){
		$scope.module = $scope.modules[nr];
	};

	$scope.pickFilter = function(nr){
		$scope.filter = $scope.filters[nr];
	};

	$scope.search = function(){
		$http.get('/log', {params: {
			mod: $scope.module.type,
			filter: $scope.filter.type
		}}).
		success(function(data){
			$scope.data = data;
		})
	};

	$scope.clear = function(){
		$http.put('/log/clear', {params: {
			mod: $scope.module.type,
			filter: $scope.filter.type
		}}).
		success(function(){
			$scope.data = [];
		})
	}
}]);
//</editor-fold>

//<editor-fold desc="Plotter">
App.provider('ploter', function(){
	var plots = [];

	var labels = [{},{}];

	var dataset = {
		sensors: {},
		units: {},
		last: 0,
		limit: 120
	};

	var active = true;

	this.$get = function(){
		var self = {
			list: function(nr){
				var type =(nr===0)? 'sensors' : 'units';

				return Object.keys(dataset[type]);
			},
			labeling: function(nr, ser){
				labels[nr] = ser;
			},
			attach: function(nr, plot){
				plots[nr] = plot;
			},
			convert: function(data){
				if(!angular.isArray(data))
					data = [data];

				if(!data.length)
					return {};

				var keys = Object.keys(data[0]),
					dataset = {};

				keys.forEach(function(i){
					dataset[i] = data.map(function(row){
						return row[i];
					});
				});

				keys.forEach(function(i){
					if(i === 'time' || i === 'id' || i === 'type' || i === 'm' || i === 'owner' || i === 'level')
						return;

					dataset[i] = dataset[i].map(function(row, index){
						return [new Date(dataset['time'][index])*1, row];
					});
				});

				if('time' in dataset)
					delete dataset['time'];

				if('id' in dataset)
					delete  dataset['id'];

				if('type' in dataset)
					delete  dataset['type'];

				if('m' in dataset)
					delete  dataset['m'];

				if('owner' in dataset)
					delete  dataset['owner'];

				if('level' in dataset)
					delete  dataset['level'];

				return dataset;
			},
			seria: function(data, series){
				var ret = [];

				for(var i in data){
					if(!series[i].hide)
						ret.push({
							label: i,
							color:series[i].color,
							data: data[i]
						});
				}

				return ret;
			},
			put: function(type, val){
				var last = dataset.last;

				for(var i in val){
					if(!dataset[type][i])
						dataset[type][i] = [];

					if(val[i][0][0]<dataset.last)
						return;

					if(dataset[type][i].unshift(val[i][0])>dataset.limit)
						dataset[type][i].pop();

					last = val[i][0][0];
				}

				dataset.last = last;
			},
			set: function(type, sets){
				dataset[type] = self.convert(sets);

				for(var i in dataset[type]){
					dataset.last = Math.max(dataset[type][i][0][0], dataset.last);
					dataset.last = Math.max(dataset[type][i][dataset[i].length-1][0], dataset.last);
					return;
				}
			},
			paint: function(nr, data){
				var type =(nr===0)? 'sensors' : 'units';

				if(data===undefined) {
					data = dataset[type];
					self.activate();
				} else{
					data = self.convert(data);
					self.deactive();
				}

				plots[nr].setData(self.seria(data, series[nr]));
				plots[nr].setupGrid();
				plots[nr].draw();
			},
			isActive: function(){
				return active;
			},
			activate: function(){
				active = true;
			},
			deactive: function(){
				active = false;
			}
		};

		return self;
	};
});

App.controller('stats', ['$scope', '$http', '$interval', 'ploter', function($scope, $http, $interval, ploter) {
	$scope.init = function(){
		//$interval(function(){
		//	$scope.stats();
		//}, 1000);
	};

	$scope.sensors = {
		'co': {
			printName: 'temp. co',
			value: 40
		},
		'cycle': {
			printName: 'temp. obiegu',
			value: 36
		},
		'helix': {
			printName: 'temp. podajnika',
			value: 36
		},
		'fuse': {
			printName: 'temp. topnika',
			value: 36
		},
		'inside': {
			printName: 'temp. wew.',
			value: 36
		}
	};
	$scope.units = {
		'co': {
			printName: 'pompa co',
			value: true
		},
		'cwu': {
			printName: 'pompa. cwu',
			value: true
		},
		'helix': {
			printName: 'podajnik',
			value: true
		},
		'cycle': {
			printName: 'pompa obiegowa',
			value: false
		},
		'fan': {
			printName: 'nadmuch',
			value: false
		}
	};
	$scope.ranges = {
		'turbine': {
			printName: 'nadmuch',
			value: 60
		}
	};

	/*
	$scope.controll = {
		units: {},
		ranges: {}
	};*/

	$scope.stats = function(){
		$http.get('/stats').
			success(function(data) {
				var sub, tag;

				for(var i in data){
					sub = ploter.convert(data[i]);

					for(var j in sub){
						tag = (j==='turbine')? 'ranges' : i;
						$scope[tag][j].value = sub[j][0][1];
					}

					ploter.put(i, sub);
				}
			}).
			error(function(err){
				throw new Error(err);
			});
	};

	$scope.manual = function(){
		$http.post('/manual', JSON.parse($scope.controll)).
			success().
			error();
	};
}]);


App.controller('plots', ['$scope', '$http', '$interval', 'ploter', function($scope, $http, $interval, ploter){
	var timePick;

	$scope.sensors = {
		'co': {
			printName: 'temp. co',
			hide: false,
			color: 1
		},
		'cycle': {
			printName: 'temp. obiegu',
			hide: false,
			color: 2
		},
		'helix': {
			printName: 'temp. podajnika',
			hide: false,
			color: 3
		},
		'fuse': {
			printName: 'temp. topnika',
			hide: false,
			color: 6
		},
		'inside': {
			printName: 'temp. wew.',
			hide: false,
			color: 5
		},
		'turbine': {
			printName: 'nadmuch',
			hide: false,
			color: 3
		}
	};

	$scope.units = {
		'co': {
			printName: 'pompa co',
			hide: false,
			color: 1
		},
		'cwu': {
			printName: 'pompa. cwu',
			hide: false,
			color: 5
		},
		'helix': {
			printName: 'podajnik',
			hide: false,
			color: 3
		},
		'cycle': {
			printName: 'pompa obiegowa',
			hide: false,
			color: 2
		},
		'fan': {
			printName: 'nadmuch',
			hide: false,
			color: 4
		}
	};

	$scope.active = [
		false,
		false
	];

	$scope.froms = [
		{
			name: 'od',
			type: 'from'
		},
		{
			name: 'do',
			type: 'to'
		}
	];

	$scope.from = $scope.froms[0];

	$scope.types = [
		{
			name: 'live',
			type: 'live'
		},
		{
			name: 'godzina',
			type: 'hour'
		},
		{
			name: 'dzien',
			type: 'day'
		},
		{
			name: 'tydzien',
			type: 'week'
		}
	];

	$scope.time = moment(new Date()).format('DD.MM.YYYY HH:MM');

	$scope.type = $scope.types[0];

	$scope.init = function(){
		timePick = $('#plotTime');
		timePick.datetimepicker({
			pick12HourFormat: false,
			language:'pl'
		});

		ploter.labeling(0, $scope.sensors);

		ploter.attach(0, $.plot($('#graph'), [], {
			xaxis: {
				mode: 'time'
			}
		}));

		ploter.labeling(1, $scope.units);

		ploter.attach(1, $.plot($('#graph'), [], {

		}));

		//$interval(function(){
		//	if(ploter.isActive()){
		//		ploter.paint(0);
		//		//ploter.paint(1);
		//	}
		//}, 1000);
	};

	$scope.pick = function(nr){
		if($scope.type.type === 'live')
			ploter.activate();
	};

	$scope.scale = function(){
		var time = moment($scope.time, 'DD.MM.YYYY HH:MM').toDate()*1,
			mod;

		if($scope.from.type === 'to'){
			switch ($scope.time.type){
				case 'hour':
					mod = 1000*60*60;
					break;
				case 'day':
					mod = 1000*60*60*24;
					break;
				case 'week':
					mod = 1000*60*60*24*7;
					break;
			}

			time -= mod;
		}

		if($scope.type.type === 'live' || time>Date.now()-15*60*1000){
			return ploter.activate();
		}

		$http.get('/stats/condition', {params: {
			type: $scope.type.type,
			time: time
		}}).
			success(function(data){
				ploter.paint(0, data.sensors);
			}).
			error();
	};
}]);
//</editor-fold>

function start(){
	/*
	var series = [[],[]],
		plots = new Plots();

	setInterval(function(){

		plots.plot.forEach(function(plot, index){
			series[index].unshift(i++);

			if(series[index].length>100)
				series[index].pop();

			plot.setData(series[index].map(function(ele, index){
				return [index, ele]
			}));

			plot.draw();
		});
	}, 500);*/
}

function simulator(){
	//odczytywanie buglogów
	//
	//wysylanie komend
	//zarzadzanie harmonogramem
	//zarzadzanie programem
	//odbieranie stanu

	return {};
}