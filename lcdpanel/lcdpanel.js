var system = require('../share/share.js'),
	share = system.System,
	Command = system.Command,
	$ = require('enderscore'),
	conf = require('../share/config.js'),
	programs = require('../share/programs.js'),
	knex = require('knex'),
	pi = require('pidriver'),
	lcd = new pi.LCD([]),	//TODO
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

//TODO
// pobierz programy przy wejsciu do menu
// zrob drzewo dla aktualnego rozkładu programow
// przy modyfikacjach nadpisz dane
// po wyjsciu zapisz

/*
* helixWork: 1000*30,
 helixStop: 1000*120,
 helixOffWork: 1000*40,
 helixOffStop: 1000*20,
 turbineWork: 1,
 turbineSpeed: 30,
 cycWork: 1,
 cycStop: 2,
 coWork: 20,
 coStop: 120,
 cwWork: 20,
 cwStop: 120,
 temp: 21,
 cycTemp: 80,
 coTemp: 55,
 cwuTemp: 55
* */

var functions = {
	time: function(min, max, step, name){
		return function(next, param){
			var conf = param.self.config,
				now = conf.get(name),
				changed = false;

			if(param.key==='up') {
				now += val*step;
				changed = true;
			} else if(param.key==='down') {
				now -= val*step;
				changed = true;
			}

			if(changed){
				if(now>max)
					now = max;
				else if(now<min)
					now = min;

				conf.set(name, now);
				param.self.changed = true;
			}

			display.show(null, ['<',now+'s','>']);
			next();
		}
	},
	speed: function(list, name){
		return function(next, param){
			var conf = param.self.config,
				now = conf.get(name),
				changed = false;

			if(param.key==='up') {
				now += 1;
				changed = true;
			} else if(param.key==='down') {
				now -= 1;
				changed = true;
			}

			if(changed) {
				if(now >= list.length)
					now = list.length-1;
				else if(now<=0)
					now = 0;

				conf.set(name, list[now]);
				param.self.changed = true;
			}

			display.show(null, ['<',list[now]+'%','>']);
			next();
		}
	},
	temp: function(min, max, step, name){
		return function(next, param){
			var conf = param.self.config,
				now = conf.get(name),
				changed = false;

			if(param.key==='up') {
				now += val*step;
				changed = true;
			} else if(param.key==='down') {
				now -= val*step;
				changed = true;
			}

			if(changed){
				if(now>max)
					now = max;
				else if(now<min)
					now = min;

				conf.set(name, now);
				param.self.changed = true;
			}

			display.show(null, ['<',now+'C','>']);
			next();
		}
	},
	switcher: function(name){
		return function(next, param){
			var conf = param.self.config,
				now = conf.get(name);

			if(param.key==='up' || param.key==='down') {
				now = !now;

				conf.set(name, now);
				param.self.changed = true;
			}

			display.show(null, ['on ['+(now? '*' : '')+'] off ['+(now? '' : '*')+'] ']);
			next();
		}
	}
};

/*
* {
* 	location: {
* 		index,
		tree,
		path
* 	},
* 	key: key,
* 	self: {
* 		manual: true,
* 		config: config,
		changed: true
	}
*
*
*
*
*
* */

/*	TODO
next(timeout)
* */


var turbineSpeeds = [30, 40, 50, 60, 70, 80, 90, 100];

var params = [
	{
		'temperatury': {
			'pokojowa': functions.temp(0, 28, 1, 'temp'),
			'kotła': functions.temp(0, 90, 1, 'cycTemp'),
			'co': functions.temp(0, 90, 1, 'coTemp')
		},
		'podajnik': {
			'czas podawania': functions.time(0, 240, 1, 'helixWork'),
			'przerwa podawania': functions.time(0, 240, 1, 'helixStop'),
			'przerwa podtrzym.': functions.time(0, 240, 1, 'helixOffStop')
		},
		'turbina': {
			'turbina': functions.switcher('turbineWork'),
			'prędkość turbiny': functions.speed(turbineSpeeds, 'turbineSpeed')
		},
		'pompa cyrkulacyjna': {
			'czas pompy': functions.time(0, 240, 1, 'cycWork'),
			'przerwa pompy': functions.time(0, 240, 1, 'cycStop')
		},
		'pompa co': {
			'czas pompy': functions.time(0, 240, 1, 'coWork'),
			'przerwa pompy': functions.time(0, 240, 1, 'coStop')
		},
		'pompa cwu': {
			'czas pompy': functions.time(0, 240, 1, 'cwWork'),
			'przerwa pompy': functions.time(0, 240, 1, 'cwStop')
		},
		'ustawienia fabryczne': function(next, param){
			display.loading();

			//TODO err
			programs.uploadDefault(param.self.config.name, function(){
				programs.load(param.self.config.name, function(){
					display.show(null, ['Przywrocono']);
					next(1000);
				});
			});
		}
	},
	function(next, param){
		var path = Object.keys(programs.loaded)[param.location.index];

		param.self.changed = false;

		if(path)
			param.self.config = programs.loaded[path];
		else{}//TODO

		next();
	},
	function(next, param){
		if(param.self.changed)
			programs.change(param.self.config);

		param.self.config = null;

		next();
	}
];

var tree = {
	'praca ręczna': [
		{
			'prędkość turbiny': functions.speed(turbineSpeeds, ''),
			'turbina': functions.switcher(),
			'podajnik': functions.switcher(),
			'pompa cykulacyjna': functions.switcher(),
			'pompa co': functions.switcher(),
			'pompa cwu': functions.switcher()
		},
		function(next, param){
			param.self.config = new Command();
			param.self.manual = true;

			param.self.config.start();
			next();
		},
		function(next, param){
			param.self.config.destroy();
			param.self.config = null;
			param.self.manual = false;

			next();
		}
	],
	'konfiguracja programów': [
		{},
		function(next, param){
			display.loading();

			programs.load(function(err, res){
				if(err){}//TODO

				Object.keys(res).forEach(function(prog){
					param.location.tree[prog] = res[prog];
				});

				next();
			});
		}
	],
	'konfiguracja domyślna': function(){
		display.loading();

		programs.schema(function(err, res){
			if(err){}//TODO

			display.show(null, ['Wczytano dane']);
			next(1000);
		});
	}
};

var display = {
	lcd: new pi.LCD([]),
	program: null,
	value: null,
	loadingTimer: null,
	tree: [],
	list: [],
	listNum: 0,
	enter: function(){
		var res = this.resolve();

		if(typeof res === 'function')
			res(0, true);
		else
			this.tree.push(Object.keys(res)[this.listNum]);

		this.rend(true);
	},
	exit: function(){
		if(this.tree.length) {
			this.tree.pop();
			this.listNum = 0;
			this.rend(false);
		}
	},
	next: function(){
		this.rend(1);
	},
	prev: function(){
		this.rend(-1);
	},
	rend: function(val){
		var level = this.resolve(),
			path = this.path(),
			keys;

		val = val || 0;

		if(!this.tree.length) {
			this.show(['cycle: ', share.sensor('cycle')+' ', ''],['co:    ', share.sensor('co')+' ', '']);
		} else if(typeof level === 'function') {
			this.show(path, level.call(this, val));
		} else {
			if($.isArray(level)) {
				if(val !== 1)
					return level.call(this, level[1]);

				level = level[1];
				val = 0;
			}

			keys = Object.keys(level);

			if(keys.length)
				return this.show(path, ['brak opcji']);

			this.listNum += val;

			if(this.listNum===keys.length)
				this.listNum = 0;

			this.show(path, ['< ',keys[this.listNum],' >']);
		}
	},
	path: function(){
		return this.tree.join(' > ');
	},
	resolve: function(){
		return this.tree.reduce(function(obj, name){
			return obj[name];
		}, tree);
	},
	show: function(top, bot){
		var buf = new Buffer(this.lcd.opts.cols);

		if(this.loadingTimer)
			clearInterval(this.loadingTimer);

		function format(arr, buf){
			if(!Array.isArray(arr))
				arr = [arr];

			buf.fill(' ');

			if(arr.length==1)
				buf.write(arr[0], Math.floor((buf.length-arr[0].length)/2));
			else {
				buf.write(arr[0]);
				buf.write(arr[1], arr[0].length);
				buf.write(arr[2], buf.length-arr[2].length);
			}

			return buf;
		}

		if(top){
			lcd.setPosition(0, 0);
			lcd.write(format(top, buf));
		}

		if(bot) {
			lcd.setPosition(0, 1);
			lcd.write(format(bot, buf));
		}
	},
	loading: function(){
		var path = this.path(),
			index = 0;

		this.loadingTimer = setInterval(function(){
			self.show(path, 'Trwa ładowanie'+$.fill(++index%4, '.').join(''));
		} ,100);
	}
};



/*
helixWork: 1000*30,
	helixStop: 1000*120,
	helixOffWork: 1000*40,
	helixOffStop: 1000*20,
	turbineWork: 1,
	turbineSpeed: 30,
	cycWork: 1,
	cycStop: 2,
	coWork: 20,
	coStop: 120,
	cwWork: 20,
	cwStop: 120,
	temp: 21,
	cycTemp: 80,
	coTemp: 55,
	cwuTemp: 55*
	* /