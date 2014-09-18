var System = require('../share/share.js'),
	share = new System(),
	conf = require('../share/config.js');

['start', 'active', 'update', 'accept', 'reject', 'sensors', 'sensor', 'unit', 'units', 'stop'].forEach(function(event){
	share.on(event, function(){
		console.log(share.options.name+':'+event, arguments);
	});
});

share.start();

share.on('update', function(){
	share.setRange({
		turbine: 40
	});

	share.setUnit({
		cycle: true,
		co: false,
		helix: true,
		cwu: false,
		fan: true
	});
});

//TODO load best turbine speed and send before command
//TODO handle db
//TODO plan loader
//TODO plan stack
//TODO send command in dependence of state
