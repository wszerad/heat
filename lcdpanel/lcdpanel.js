var $ = require('enderscore'),
	//system = require('../share/share.js'),
	//share = system.System,
	//Command = system.Command,
	conf = require('../share/config.js'),
	programs = require('../share/programs.js'),
	knex = require('knex'),
	LCD = require('../trash/rl-test.js').LCD,
	lcd = new LCD(16, 2),
	//pi = require('pidriver'),
	//lcd = new pi.LCD([]),	//TODO,
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

//TODO
///wracanie po drzewie
//wystylowanie napisów

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
			//TODO
			//command = new Command();
			//command.start();

			next();
		},
		function(next){
			//command.stop();

			next();
		}
	];
};

var tree = {
		'praca ręczna': formatManual(),
		'konfig. programów': (function(){
			var blank = {};

			return [
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
				}];
		})(),
		'ustawienia fab.': function(next){
			display.loading();

			programs.programs.schema(function(err){
				if(err){}//TODO

				display.show(null, ['Wczytano dane']);
				next(1000);
			});
		}
	};

var display = {
	lcd: lcd,
	inMain: true,
	program: null,
	value: null,
	timer: null,
	lock: false,
	keyFuu: null,
	tree: [],
	list: [],
	listNum: 0,
	enter: function(){
		var self = this,
			onStart, res;

		if(self.list && self.list.length)
			self.tree.push(self.list[self.listNum]);

		res = self.resolve();
		console.log(res);

		if($.isArray(res)) {
			onStart = res[1];

			if(onStart)
				onStart(self.next(self.handle.bind(self)));
			else
				self.handle();
		} else
			self.handle();

	},
	handle: function(){
		var self = this,
			res = self.resolve();

		if($.isArray(res))
			res = res[0];

		if($.isFunction(res)) {
			self.list = null;
			res(self.next(self.slide));
		} else if(res.isCollection) {
			self.list = Object.keys(res.collection);
			self.slide();
		} else if(res.isParameter) {
			var next = self.enter;

			self.list = null;

			switch (res.type){
				case 'switch':
					self.show(self.path(), ['<','['+(res.value? '*' : ' ')+'] on off ['+(res.value? ' ' : '*')+']','>']);
					break;
				case 'list':
					self.show(self.path(), ['<',res.value,'>']);
					break;
				case 'range':
					self.show(self.path(), ['<',res.value,'>']);
					break;
			}

			self.key(function(key){
				switch (key){
					case 'next':
						res.next();
						break;
					case 'prev':
						res.prev();
						break;
					case 'close':
					case 'ok':
						next = self.exit;
						break;
				}

				self.next(next)();
			});
		} else {
			self.list = Object.keys(res);
			self.slide();
		}
	},
	exit: function(){
		var self = this,
			res = this.resolve(),
			exit = function(){
				var len = self.tree.length;

				if(len) {
					self.tree.pop();

					self.handle();
				} else {
					self.main();
				}
			};

		if($.isArray(res) && res[2])
			res[2](self.next(exit));
		else
			exit();
	},
	slide: function(dir, force){
		var path = this.path(),
			list = this.list,
			len = this.list.length;

		if(force) {
			this.listNum = dir;
			return this.slide(dir);
		}

		if(!dir && this.listNum == null){
			this.listNum = list.indexOf(this.tree[len-1]);
		} else {
			this.listNum += dir || 0;
		}

		if(this.listNum<0)
			this.listNum = len-1;
		else if(this.listNum>=len)
			this.listNum = 0;

		this.show(path, ['< ',list[this.listNum],' >']);
	},
	path: function(){
		return this.tree.join(' > ');
	},
	resolve: function(){
		return this.tree.reduce(function(obj, name){

			if($.isArray(obj))
				obj = obj[0];

			if(obj.isCollection)
				return obj.collection[name];

			return obj[name];
		}, tree);
	},
	show: function(top, bot){
		var buf = new Buffer(this.lcd.opts.cols);

		function format(arr, buf){
			if(!Array.isArray(arr))
				arr = [arr];

			arr = arr.map(function(ele){

				return ele.toString().substr(0, buf.length);
			});

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

			setTimeout(cb.bind(self), timeout);
		};
	},
	//(next, prev, ok, cancel)
	keyPress: function(key){
		if(this.lock)
			return;

		if(this.timer)
			clearInterval(this.timer);

		if(this.keyFuu)
			return this.keyFuu(key);

		if(this.inMain) {
			this.inMain = false;
			return this.slide();
		}

		if(key === 'ok')
			this.enter();
		else if(key === 'close')
			this.exit();
		else if(key === 'next')
			this.slide(1);
		else
			this.slide(-1);
	},
	key: function(cb){
		this.keyFuu = cb;
	},
	interval: function(fuu, interval){
		var self = this;

		self.timer = setInterval(fuu, interval);
	},
	loading: function(){
		var self = this,
			index;

		self.interval(function(){
			self.show(path, 'Trwa ładowanie'+$.fill(++index%4, '.').join(''));
		}, 100);
	},
	main: function(){
		var c = 0,
			self = this;

		self.inMain = true;

		self.interval(function(){
			self.show('cycle: '+(55+(c++%3)), 'co: '+(45+(c++%3)));
		}, 1000);
	}
};

lcd.onkey(function(key){
	display.keyPress(key);
});

display.handle();
display.exit();