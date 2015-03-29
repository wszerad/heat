var $ = require('enderscore'),
	conf = require('../share/config.js');

module.exports = function(share){
	function sets(self, cb){
		var state = (self.seciurityControled)? self.seciurityState : self.nextState;

		if($.isArray(self.driver)) {
			try {
				console.log('write '+self.name+' state: '+state);
				self.driver.forEach(function(driver, index){
					//driver.write(state[index]);
				});
			} catch (e){
				cb(e);
			}
			cb(null);
		} else {
			console.log('write '+self.name+' state: '+state);
			//self.driver.write(state, cb);
		}
	}

	var Unit = function(name, driver, options){
		this.name = name;
		this.driver = driver;
		this.opt = options;
		this.nextState = false;
		this.lastChange = Date.now();
		this.timeout = null;
		this.seciurityControled = false;
		this.seciurityState = false;
	};

	Unit.prototype.seciurityBlock = function(state){
		var self = this,
			cb = function(){
				share.setUnit(self.name, self.seciurityState);
			};

		if(self.seciurityControled && self.seciurityState===state)
			return;

		self.seciurityControled = true;
		self.seciurityState = state;
		sets(self, cb);
	};

	Unit.prototype.seciurityUnblock = function(){
		var self = this;

		if(!self.seciurityControled)
			return;

		self.seciurityControled = false;
		self.setChange(self.nextState);
	};

	Unit.prototype.setChange = function(state){
		var self = this,
			timeout = self.opt.timeout || conf.unitTimeout,
			timeoutDiff = self.lastChange+timeout-Date.now(),
			cb = function(){
				share.setUnit(self.name, self.nextState);
			};

		if(state === self.nextState)
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