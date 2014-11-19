var $ = require('enderscore'),
	//system = require('../share/share.js'),
	//share = system.System,
	//Command = system.Command,
	conf = require('../share/config.js'),
	programs = require('../share/programs.js'),
	para = require('../share/paramerters.js'),
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

var menu = {};

menu.main = {
	prev: null,
	printName: 'main',
	run: function () {
		var c = 0;

		//display.list([menu.manual(), menu.configs, menu.reset]);

		//display.interval(function () {
		display.show('cycle: ' + (55 + (c++ % 3)), 'co: ' + (45 + (c++ % 3)));
		//}, 1000);

		display.key(function(key){
			display.unkey();
			display.enter(menu.menu);
		});
	}
};

menu.menu = {
	prev: menu.main,
	printName: 'menu',
	run: function () {
		display.list([menu.manual(), menu.configs, menu.reset, menu.running]);
	}
};

menu.running = {
	prev: menu.menu,
	printName: 'program',
	run: function(){}
};

menu.manual = function () {
	var command,
		manual = programs.manual();

	return {
		prev: menu.menu,
		printName: 'praca reczna',
		list: manual,
		enter: function(next) {
			//manual.keep();
			//TODO
			//command = new Command();
			//command.start();
			next();
		},
		leave: function(next) {
			//manual.backup();
			//command.stop();
			next();
		}
	}
};

menu.reset = {
	prev: menu.menu,
	printName: 'ust. fabr.',
	run: function(next) {
		display.driver(menu.sign(), function(value) {
			if(value) {
				display.lock();
				display.loading();
				programs.programs.schema(function (err) {
					if (err) {}//TODO

					next(1000);
					display.show(null, ['Wczytano dane']);
				});
			} else {
				next();
			}
		});
	}
};

menu.configs = {
	prev: menu.menu,
	printName: 'konfiguracje',
	run: function () {
		display.loading();
		programs.programs.load(function (err, res) {
			var list = {};

			res.forEach(function (prog) {
				prog.keep();
				list[prog.name] = menu.program(prog);
			});

			display.clearInterval();
			display.list(list);
		});
	}
};

menu.program = function (prog) {
	//console.log(menu.programScheme(prog, this).temp);
	var ret = {};

	$.extend(ret, {
		prev: menu.configs,
		printName: prog.name,
		list: menu.programScheme(prog, ret),
		leave: function(next) {
			console.log(prog);
			if (prog.isChanged()) {
				display.driver(menu.sign(), function (value) {
					if (value) {
						display.loading();
						programs.programs.update(prog, function(err) {
							//TODO error handle and communicant (success or error)
							next(1000);
							display.show(null, 'Zapisano');
						});
					} else {
						next();
					}
				})
			}
		}
	});

	return ret;
};

menu.programScheme = function (prog, prev) {
	return {
		'temp': {
			prev: prev,
			printName: 'temperatury',
			list: [
				prog.collection['temp'],
				prog.collection['cycTemp'],
				prog.collection['coTemp']
			]
		},
		'helix': {
			prev: prev,
			printName: 'podajnik',
			list: [
				prog.collection['helixWork'],
				prog.collection['helixStop'],
				prog.collection['helixOffStop']
			]
		},
		'turbine': {
			prev: prev,
			printName: 'turbina',
			list: [
				prog.collection['turbineWork'],
				prog.collection['turbineSpeed']
			]
		},
		'cycle': {
			prev: prev,
			printName: 'pompa cyrkulacyjna',
			list: [
				prog.collection['cycWork'],
				prog.collection['cycStop']
			]
		},
		'co': {
			prev: prev,
			printName: 'pompa co',
			list: [
				prog.collection['coWork'],
				prog.collection['coStop']
			]
		},
		'cwu': {
			prev: prev,
			printName: 'pompa cwu',
			list: [
				prog.collection['cwuWork'],
				prog.collection['cwuStop']
			]
		},
		'reset': {
			prev: prev,
			printName: 'ustawienia fabryczne',
			run: function (next) {
				display.loading();

				//TODO err
				programs.programs.toDefault(prog);
				programs.programs.update(prog, function () {
					next(1000);
					display.show(null, ['Przywrocono']);
				});
			}
		}
	}
};

menu.sign = function(){
	return new para.Parameter('reset', {
		printName: 'potwierdz',
		type: 'sign',
		def: false
	});
};


var display = {
	lcd: lcd,
	//program: null,
	value: null,
	timer: null,
	locked: false,
	keyFuu: null,
	//tree: [],
	//printTree: [],
	items: null,
	//printList: [],
	hasList: false,
	itemNum: 0,
	currItem: null,
	//selected: 0,
	next: function(next){
		var self = this;

		if(!next)
			next = function(){
				if(self.hasList)
					display.slide();
				else
					display.exit();
			};

		return function(wait){
			wait = wait || 0;

			self.unlock();
			self.unkey();
			self.clearInterval();

			setTimeout(function(){
				next();
			}, wait);
		};
	},
	enter: function(next){
		var self = this,
			handle = function(){
				if(next.isParameter)
					return self.driver(next);

				self.currName = self.itemNum;
				self.currItem = next;

				if(next.run)
					return next.run(self.next());

				if(next.isCollection)
					self.list(next.collection);
				else if(next.list)
					self.list(next.list);

				self.hasList = true;
			};

		self.hasList = false;

		if(!next){
			if(self.currItem===null){
				next = menu.main;
			} else {
				next = self.items[self.itemNum];
			}
		}

		if(next.enter)
			next.enter(handle);
		else
			handle();
	},
	list: function(list){
		var self = this;

		self.hasList = true;
		self.itemNum = null;
		self.items = (list.isCollection)? list.collection : list;

		self.slide();
	},
	driver: function(driver, cb){
		var self = this,
			print1 = self.path(driver.printName);

		switch (driver.type){
			case 'switch':
				self.show(print1, ['<','['+(driver.value? '*' : ' ')+'] on off ['+(driver.value? ' ' : '*')+']','>']);
				break;
			case 'list':
				self.show(print1, ['<',driver.value,'>']);
				break;
			case 'range':
				self.show(print1, ['<',driver.value,'>']);
				break;
			case 'sign':
				self.show(print1, ['<',' '+(driver.value? '*' : ' ')+' TAK NIE '+(driver.value? ' ' : '*')+' ','>']);
				break;
		}

		self.key(function(key){
			switch (key){
				case 'next':
					driver.next();
					display.driver(driver, cb);
					break;
				case 'prev':
					driver.prev();
					display.driver(driver, cb);
					break;
				case 'close':
					driver.backup();
				case 'ok':
					driver.keep();
					display.unkey();

					if(cb)
						cb(driver.value);
					else
						display.slide(0);
					break;
			}
		});
	},
	exit: function(){
		var self = this,
			next = self.next(function(){
				if(self.currItem.prev)
					display.enter(self.currItem.prev);
			});

		self.itemNum = null;

		if(self.currItem && self.currItem.leave)
			self.currItem.leave(next);
		else
			next();
	},
	slide: function(dir, force){
		var self = this,
			isArray = $.isArray(self.items),
			parent = self.items,
			elements = self.items,
			idx = self.itemNum || 0,
			print1, print2, len;

		dir = dir || 0;

		if(!isArray){
			elements = Object.keys(parent);
			idx = elements.indexOf(self.itemNum);
		}

		len = elements.length;
		idx += dir;

		if(idx<0)
			idx = len-1;
		else if(idx>=len)
			idx = 0;

		if(isArray){
			self.itemNum = idx;
		} else {
			self.itemNum = elements[idx];
		}

		//console.log(self);
		//console.log(elements);
		//console.log(self.itemNum)
		//console.log(self);

		//console.log(self);
		//if(self.currItem===null)
		//	throw new Error('null');
		//console.log(parent, self);

		print1 = self.path(self.currItem.printName || self.currName);
		print2 = parent[self.itemNum].printName || parent[self.itemNum].name || self.itemNum;

		this.show(print1, ['< ',print2,' >']);
	},
	path: function(print){
		return ['-', print, '-'];
	},
	show: function(top, bot){
		var buf = new Buffer(this.lcd.opts.cols);

		function format(arr, buf){
			var free;

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
				free = Math.floor((buf.length - arr[0].length - arr[1].length - arr[2].length)/2);

				if(free<0)
					free = 0;

				buf.write(arr[1], arr[0].length+free);
				buf.write(arr[2], buf.length-arr[2].length);
			}

			return buf;
		}

		try{
			if(top){
				lcd.setPosition(0, 0);
				lcd.write(format(top, buf));
			}

			if(bot) {
				lcd.setPosition(0, 1);
				lcd.write(format(bot, buf));
			}
		}catch (e){
			console.log(top, bot);
		}
	},
	//(next, prev, ok, cancel)
	keyPress: function(key){
		if(this.locked)
			return;

		if(this.timer)
			clearInterval(this.timer);

		if(this.keyFuu)
			return this.keyFuu(key);

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
	unkey: function(){
		this.keyFuu = null;
	},
	lock: function(){
		this.locked = true;
	},
	unlock: function(){
		this.locked = false;
	},
	interval: function(fuu, interval){
		var self = this;

		self.timer = setInterval(fuu, interval);
	},
	loading: function(){
		var self = this,
			index = 0;

		self.interval(function(){
			self.show('Trwa ladowanie', $.fill(++index%4, '.').join(''));
		}, 100);
	},
	clearInterval: function(){
		var self = this;

		clearInterval(self.timer);
		self.timer = null;
	}
};

lcd.onkey(function(key){
	display.keyPress(key);
});

//display.handle();
display.enter();