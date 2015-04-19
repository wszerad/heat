var $ = require('enderscore'),
	Share = require('../share/share.js'),
	share = Share.System(),
	Command = Share.Command,
	conf = require('../share/config.js'),
	parameters = require('./parameters.js'),
	Parameter = parameters.Parameter,
	Collection = parameters.Collection,
	_ = require('../util/pidriver/pidriver.js'),
	right = new _.Gpio('GPIO27', {pull: _.PUD_DOWN, mode: _.INPUT}),
	bottom = new _.Gpio('GPIO17', {pull: _.PUD_DOWN, mode: _.INPUT}),
	left = new _.Gpio('GPIO22', {pull: _.PUD_DOWN, mode: _.INPUT}),
	top = new _.Gpio('GPIO25', {pull: _.PUD_DOWN, mode: _.INPUT}),
	lcd = new _.LCD([8,10,12,16,18,7]);	//TODO,


share.start();
var menu = {};

menu.main = {
	prev: null,
	text: 'main',
	run: function () {
     var mod = true;
		display.interval(function () {
			mod = !mod;
      if(mod)
        display.show(['Temp. pieca','',share.sensor('cycTemp')+'*C'], ['Temp. CO','',share.sensor('coTemp')+'*C']);
      else
        display.show(['Temp. CWU','',share.sensor('cwuTemp')+'*C'], ['Temp. wew.','',share.sensor('insideTemp')+'*C']);
		}, 5000);

		display.key(function(key){
			display.unkey();
			display.enter(menu.menu);
		});
	}
};

menu.menu = {
	prev: menu.main,
	text: 'menu',
	run: function() {
		display.list([menu.manual(), menu.configs, menu.reset, menu.running()]);
	}
};

menu.running = function(){
	var pick = new Parameter('harmonogram', {
		text: 'aktywny',
		type: 'enum',
		default: false,
		enum: []
	});

	return {
		prev: menu.menu,
		text: 'harmonogramy',
		run: function(next) {
			display.loading();

			conf.ScheduleModel.list(function(err, res){
				pick.values = res.map(function(schedule){
					if(schedule.active)
						pick.value = pick.prevValue = schedule.name;

					return schedule.name
				});

				display.clearInterval();
				display.driver(pick, function(){
					if(pick.isChanged()) {
						display.driver(menu.sign(), function (value) {
							if (value) {
								display.loading();

								 conf.ScheduleModel.activate(pick.value, function(err){
									 if(err){
										 display.clearInterval();
										 next(1000);
										 display.show(null, 'Bład zapisu');
										 return;
									 }

									 display.clearInterval();
									 next(1000);
									 display.show(null, 'Zapisano');
								 });
							} else {
								next();
							}
						});
					}
				});
			});
		}
	};
};

menu.manual = function () {
	var command,
		manual = new Collection('manual', {
			text: 'praca ręczna',
			collection: conf.CommandModel.getViews(function(element){
				return element.show;
			}, ['text', 'type', 'default', 'enum']).map(function(param){
				return new Parameter(param.name, param);
			})
		}),
		listener = function(name, val){
			command.setUnit(name, val);
		};

	conf.CommandModel.getViews(function(element){
		return element.isParameter;
	}, ['text', 'type', 'default', 'enum']);

	return {
		prev: menu.menu,
		text: 'praca reczna',
		list: manual,
		enter: function(next) {
			command = Command();
			command.start();
			manual.keep();
			manual.listen(listener);

			next();
		},
		leave: function(next) {
			command.stop();
			manual.backup();
			manual.unlisten(listener);

			next();
		}
	}
};

menu.reset = {
	prev: menu.menu,
	text: 'ust. fabr.',
	run: function(next) {
		display.driver(menu.sign(), function(value) {
			if(value) {
				display.lock();
				display.loading();

				//TODO err handle
				conf.ProgramModel.init(function(err, done){
					conf.ScheduleModel.init(function(err, done){
						conf.EventModel.init(function(err, done){
							next(1000);
							display.show(null, ['Wczytano dane']);
						});
					})
				});
			} else {
				next();
			}
		});
	}
};

menu.configs = {
	prev: menu.menu,
	text: 'programy',
	run: function () {
		display.loading();

		conf.ProgramModel.list(function(err, res){
			var list = {},
				schema = conf.ProgramModel.getViews(function(element){
					return element.isParameter;
				}, ['text', 'type', 'min', 'max', 'step', 'enum']);

			res.forEach(function (prog){
				prog = parameters.utils.modelToCollection(prog, schema);
				prog.keep();
				list[prog.name] = menu.program(prog);
			});

			display.clearInterval();
			display.list(list);
		});
	}
};

menu.program = function (prog) {
	var ret = {};

	$.extend(ret, {
		prev: menu.configs,
		text: prog.name,
		list: menu.programMenuStructure(prog, ret),
		leave: function(next) {
			if (prog.isChanged()) {
				display.driver(menu.sign(), function (value) {
					if (value) {
						display.loading();

						conf.ProgramModel.forge(prog.value).save().exec(function(err, done){
							//TODO err
							next(1000);
							display.show(null, 'Zapisano');
						});
					} else {
						next();
					}
				});
			}
		}
	});

	return ret;
};

menu.programMenuStructure = function (prog, prev) {
	var scheme = conf.ProgramModel.getViews(function(element){return element.isParameter;}, ['text', 'category', 'type', 'min', 'max', 'step', 'enum']),
		ret = {
			'reset': {
				prev: prev,
				text: 'ustawienia fabryczne',
				run: function (next) {
					display.loading();

					conf.ProgramModel.toDefault(prog.value);
					prog.keep();
					conf.ProgramModel.forge(prog.value).save().exec(function(err, done){
						//TODO err
						next(1000);
						display.show(null, ['Przywrocono']);
					})
				}
			}
		};

	scheme.reduce(function(cats, param){
		if(!(param.category in cats))
			cats[param.category] = {
				prev: prev,
				text: param.category,
				list: []
			};

		var cat = cats[param.category];
		cat.list.push(prog.collection[param.name]);

		return cats;
	}, ret);

	return ret;
};

menu.sign = function(){
	return new Parameter('reset', {
		text: 'potwierdz',
		type: 'sign',
		default: false
	});
};

var display = {
	lcd: lcd,
	value: null,
	timer: null,
	locked: false,
	keyFuu: null,
	items: null,
	hasList: false,
	itemNum: 0,
	currItem: null,
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
			print1 = self.path(driver.text);

		switch (driver.type){
			case 'boolean':
				self.show(print1, ['<','['+(driver.value? '*' : ' ')+'] on off ['+(driver.value? ' ' : '*')+']','>']);
				break;
			case 'enum':
				self.show(print1, ['<',driver.value,'>']);
				break;
			case 'integer':
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
	slide: function(dir){
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

		print1 = self.path(self.currItem.text || self.currName);
		print2 = parent[self.itemNum].text || parent[self.itemNum].name || self.itemNum;

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

var states = {
	right: null,
	left: null,
	top: null,
	bottom: null
};
	
function edge(key, dir){
	if(states[key]!==null || dir===0)
		return;

	states[key] = setTimeout(function(){
		states[key] = null;
	}, 200);

	switch(key){
		case 'right':
			display.keyPress('next');
			break;
		case 'top':
			display.keyPress('ok');
			break;
		case 'bottom':
			display.keyPress('close');
			break;
		case 'left':
			display.keyPress('prev');
			break;
	}
}
	
right.on('up', edge.bind(null, 'right', 1));
right.on('down', edge.bind(null, 'right', 0));
left.on('up', edge.bind(null, 'left', 1));
left.on('up', edge.bind(null, 'left', 0));
top.on('up', edge.bind(null, 'top', 1));
top.on('up', edge.bind(null, 'top', 0));
bottom.on('up', edge.bind(null, 'bottom', 1));
bottom.on('up', edge.bind(null, 'bottom', 0));

display.enter();