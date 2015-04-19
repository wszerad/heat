var tests = [];

var securityCheck = exports.securityCheck = function(){
	var stack = [];

	tests.forEach(function(test){
		var res = test.check();
		if(res!==false)
			stack.push(res);
	});

	return {
		warning: stack.length>0,
		stack: stack
	};
};

var register = exports.register = function(on, off, test, msg){
	tests.push(new Security(on, off, test, msg));
};

var Security = function(on, off, test, msg){
	this.active = false;
	this.on = [].concat(on);
	this.off = [].concat(off);
	this.test = test;
	this.msg = msg;
};

Security.prototype.activate = function(){
	if(this.active)
		return false;

	this.active = true;

	this.on.forEach(function(unit){
		unit.securityBlock(true);
	});

	this.off.forEach(function(unit){
		unit.securityBlock(false);
	});

	return true;
};

Security.prototype.deactivate = function(){
	if(!this.active)
		return false;

	this.active = false;

	[].concat(this.on, this.off).forEach(function(unit){
		unit.securityUnblock();
	});

	return true;
};

Security.prototype.check = function(){
	if(this.test()){
		if(this.activate())
			return this.msg;
	} else {
		this.deactivate();
	}

	return false;
};