var co = require('co'),
	sleep = require('co-sleep'),
	thunk = require('thunkify');


co(function*(koko){
	console.log(arguments);
	console.log(this);
	sleep(1000);
	return {co: true}
}).call({tr: true}, function(){
	console.log(arguments);
});