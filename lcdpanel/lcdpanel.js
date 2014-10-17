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

var formatProgram = function(prog){
	return [{
		'temperatury': [
			prog.collection['temp'],
			prog.collection['cycTemp'],
			prog.collection['coTemp']
		],
		'podajnik': [
			prog.collection['helixWork'],
			prog.collection['helixStop'],
			prog.collection['helixOffStop']
		],
		'turbina': [
			prog.collection['turbineWork'],
			prog.collection['turbineSpeed']
		],
		'pompa cyrkulacyjna': [
			prog.collection['cycWork'],
			prog.collection['cycStop']
		],
		'pompa co': [
			prog.collection['coWork'],
			prog.collection['coStop']
		],
		'pompa cwu': [
			prog.collection['cwWork'],
			prog.collection['cwStop']
		],
		'ustawienia fabryczne': function(next){
			display.loading();

			//TODO err
			programs.programs.toDefault(prog);
			programs.programs.update(prog, function(){
				display.show(null, ['Przywrocono']);
				next(1000);
			});
		}
	},
	function(next){
		prog.keep();

		next();
	},
	function(next){
		display.show(['Zapisac zmiany?'], ['Tak','','Nie']);

		//TODO add method
		display.key(function(key){
			if(key === 'ok') {
				programs.programs.update(prog);
			} else if(key === 'close') {
				prog.backup();
			} else {
				return;
			}

			next();
		});
	}];
};

var formatManual = function(){
	var command;

	return [
		programs.manual(),
		function(next){
			command = new Command();
			command.start();

			next();
		},
		function(next){
			command.stop();

			next();
		}
	];
};

var blank = {};

var tree = {
	'praca ręczna': formatManual(),
	'konfiguracja programów': [
		blank,
		function(next){
			display.loading();

			programs.programs.loadAll(function(){
				var prog;

				for(var i in programs.programs.cache){
					prog = programs.programs.cache[i];
					blank[i] = formatProgram(prog);
				}

				next();
			});
		}
	],
	'konfiguracja domyślna': function(next){
		display.loading();

		programs.programs.schema(function(err){
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
	keyFuu: null,
	tree: [],
	list: [],
	listNum: 0,
	enter: function(){
		var res = this.resolve();

		if($.isArray(res)) {
			var show = function(){
				//TODO show tree from res[0]
			};

			if(res[1])
				res[1](this.next(show));
			else
				show();
		} else if($.isFunction(res)) {
			res(this.next(this.slide));
		} else if(res.isCollection) {

		} else if(res.isParameter) {

		} else {

		}
		if(typeof res === 'function')
			res(0, true);
		else
			this.tree.push(Object.keys(res)[this.listNum]);

		this.rend(true);
	},
	exit: function(){
		var self = this,
			res = this.resolve(),
			exit = function(){
				var len = self.tree.length;

				if(len--) {
					self.tree.pop();

					if(!len)
						return self.main();

					var idx = Object.keys(self.resolve()).indexOf(self.tree[len-1]);
					self.listNum =(idx !== -1)? idx : 0;
					self.slide();
				}
			};

		if($.isArray(res) && res[2])
			res[2](self.next(exit));
		else
			exit();
	},
	slide: function(dir){
		var path = this.path(),
			level = this.resolve(),
			keys = Object.keys(level);

		dir = dir || 0;

		this.listNum += dir;

		this.show(path, ['< ',keys[this.listNum],' >']);
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
	next: function(cb){
		var self = this;

		return function(timeout){
			timeout = timeout || 0;
			self.keyFuu = null;

			setTimeout(cb, timeout);
		};
	},
	//(next, prev, ok, cancel)
	keyPress: function(key){
		if(this.loadingTimer)
			return;

		if(this.keyFuu)
			return this.keyFuu(key);

		if(key === 'ok')
			this.enter();
		else if(key === 'cancel')
			this.exit();
		else if(key === 'next')
			this.slide(1);
		else
			this.slide(-1);
	},
	key: function(cb){
		this.keyFuu = cb;
	},
	loading: function(){
		var path = this.path(),
			index = 0;

		this.loadingTimer = setInterval(function(){
			self.show(path, 'Trwa ładowanie'+$.fill(++index%4, '.').join(''));
		} ,100);
	},
	main: function(){
		this.show(['cycle: ', share.sensor('cycle')+' ', ''],['co:    ', share.sensor('co')+' ', '']);
		//TODO main pulpit
	}
};