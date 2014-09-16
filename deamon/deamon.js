var share = require('../share/share.js'),
	conf = require('../share/config.js');
//all events:
/**
 * start - after send register, process message listing, connect to database on master
 * active - after register in master and connect create
 * update - each status update
 * accept -
 * reject -
 * sensor -
 * sensors -
 * unit -
 * units -
 * stop -
 */

['start', 'active', 'update', 'accept', 'reject', 'sensors', 'sensor', 'unit', 'units', 'stop'].forEach(function(event){
	share.on(event, function(){
		console.log(event, arguments);
	});
});

share.start();

setTimeout(function(){console.log('end')} ,10000);

//TODO load all temperatures, reset all pins
//TODO start share
//TODO add timer for components reconfiguration based on level