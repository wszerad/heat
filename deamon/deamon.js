var System = require('../share/share.js'),
	share = new System(),
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
 * range -
 * ranges -
 * unit -
 * units -
 * stop -
 */

['start', 'active', 'update', 'accept', 'reject', 'sensors', 'sensor', 'unit', 'units', 'stop'].forEach(function(event){
	share.on(event, function(){
		console.log(share.options.name+':'+event, arguments);
	});
});

share.once('start', function(){
	share.prepareDB();
});

share.start();

share.log('error', new Error('testujemy'));

setTimeout(function(){
	share.setSensor({
		cycle: 55,
		co: 55,
		helix: 25,
		fuse: 0,
		inside: 19
	});
}, 1000);

//TODO load all temperatures, reset all pins
//TODO start share
//TODO add timer for components reconfiguration based on level