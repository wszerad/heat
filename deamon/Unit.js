var $ = require('enderscore'),
	conf = require('../share/config.js'),
	PWMTable = {
		0: [1,0,0,0,0,0],
		20: [1,1,0,0,0,0],
		40: [1,1,1,0,0,0],
		60: [1,1,1,1,0,0],
		80: [1,1,1,1,1,0],
		100: [1,1,1,1,1,1]
	};

module.exports = function(share){
	function sets(self, cb){
		var state = (self.securityControled)? self.securityState : self.nextState;

		if($.isArray(self.driver)) {
			try {
				console.log('write '+self.name+'('+self.driver.map(function(d){return d.pin}).join(',')+') state: '+state);
				self.driver.forEach(function(driver, index){
					driver.write(PWMTable[state][index]);
				});
			} catch (e){
				cb(e);
			}
			cb(null);
		} else {
			console.log('write '+self.name+'('+self.driver.pin+') state: '+state);
			self.driver.write(state, cb);
		}
	}

	var Unit = function(name, driver, options){
		this.name = name;
		this.driver = driver;
		this.opt = options;
		this.nextState = false;
		this.lastChange = Date.now();
		this.timeout = null;
		this.securityControled = false;
		this.securityState = false;
	};

	Unit.prototype.securityBlock = function(state){
		var self = this,
			cb = function(){
				share.setUnit(self.name, self.securityState);
			};

		if(self.securityControled && self.securityState===state)
			return;

		self.securityControled = true;
		self.securityState = state;
		sets(self, cb);
	};

	Unit.prototype.securityUnblock = function(){
		var self = this;

		if(!self.securityControled)
			return;

		self.securityControled = false;
		self.setChange(self.nextState, true);
	};

	Unit.prototype.setChange = function(state, force){
		var self = this,
			timeout = self.opt.timeout || conf.unitTimeout,
			timeoutDiff = self.lastChange+timeout-Date.now(),
			cb = function(){
				share.setUnit(self.name, self.nextState);
			};

		if(state === self.nextState && !force)
			return;

		self.nextState = state;

		if(timeoutDiff<=0) {
			sets(self, cb);
		} else if(self.timeout === null) {
			self.timeout = setTimeout(function(){
				sets(self, cb);
				self.timeout = null;
			}, timeoutDiff);
		}
	};

	return Unit;
};