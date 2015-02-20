var config = require('./share/config.js'),
	Promise = require("bluebird");

var inits = [config.ProgramModel, config.EventModel, config.CommandModel, config.StatusModel, config.ScheduleModel, config.LogsModel].map(function(model){
	return Promise.promisify(model.init.bind(model))();
});

Promise.all(inits)
	.then(function(dones){
		console.log(dones);
	})
	.catch(function(err){
		throw err;
	});

/*
config.ScheduleModel.init(function(){
	console.log(arguments);
})*/