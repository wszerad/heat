var System = require('../share/share.js'),
	share = new System(),
	db = require('knex')({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	}),
	co = require('co'),
	sleep = require('co-sleep'),
	conf = require('../share/config.js'),
	nconf = require('nconf'),
	params = new nconf.Provider({
		store: {
			type: 'file',
			file: path.join(__dirname, '../share/params/manager.json')
		}
	});

var Cycle = function(cycle, programs){
	this.programs = programs;
	this.programsNames = [];
	this.actualProgram = null;
	this.cycle = cycle;
};

Cycle.prototype.setProgram = function(program){
	if($.isInteger(program))
		this.actualProgram = program;
	else
		this.actualProgram = this.programsNames.indexOf(program);
};

Cycle.prototype.run = function(){
	var self = this;

	function rerun(err, ret){
		if(ret!==false)
			self.run.call(self);
	}

	co(self.cycle).call(self.programs[self.actualProgram], rerun);
};

var programs = {
	day: {
		helixWork: 1000*30,
		helixStop: 1000*120,
		helixOffWork: 1000*40,
		helixOffStop: 1000*20,
		turbineWork: 1,
		turbineSpeed: 30,
		cycWork: 1,
		cycStop: 2,
		coWork: 20,
		coStop: 120,
		cwWork: 20,
		cwStop: 120,
		temp: 21,
		cycTemp: 80,
		coTemp: 55,
		cwuTemp: 55
	}/*,
	night: {
		helixWork: 1000*30,
		helixStop: 1000*120,
		turbineWork: 1,
		turbineSpeed: 30,
		coWork: 20,
		coStop: 120,
		cwWork: 20,
		cwStop: 120,
		temp: 15,
		coTemp: 80,
		cwuTemp: 55
	},
	water: {
		helixWork: 1000*30,
		helixStop: 1000*120,
		turbineWork: 1,
		turbineSpeed: 30,
		coWork: 20,
		coStop: 120,
		cwWork: 20,
		cwStop: 120,
		temp: 21,
		coTemp: 80,
		cwuTemp: 55
	},
	standby: {
		helixWork: 1000*30,
		helixStop: 1000*120,
		turbineWork: 0,
		turbineSpeed: 30,
		coWork: 20,
		coStop: 120,
		cwWork: 20,
		cwStop: 120,
		temp: 21,
		coTemp: 80,
		cwuTemp: 55
	},
	stop: {
		helixWork: 1000*30,
		helixStop: 1000*120,
		turbineWork: 1,
		turbineSpeed: 30,
		coWork: 20,
		coStop: 120,
		cwWork: 20,
		cwStop: 120,
		temp: 21,
		coTemp: 80,
		cwuTemp: 55
	}*/
};

//	HELIX AND TURBINE WORK
var heating = new Cycle(function*(){
	if(this.turbineSpeed)
		share.setRange('turbine', this.turbineSpeed);

	if(this.cycTemp && share.sensor('cycle')<this.cycTemp){
		share.setUnit('fan', true);

		if(this.helixWork) {
			share.setUnit('helix', true);
			yield sleep(this.helixWork);
		}

		if(this.helixStop) {
			share.setUnit('helix', false);
			yield sleep(this.helixStop);
		}
	} else {
		share.setUnit('fan', false);

		if(this.helixWork) {
			share.setUnit('helix', true);
			yield sleep(this.helixOffWork);
		}

		if(this.helixStop) {
			share.setUnit('helix', false);
			yield sleep(this.helixOffStop);
		}
	}

	if(this.stop){
		share.setUnit('fan', false);
		return false;
	}
}, programs);

// CYCLE WORK
var cycle = new Cycle(function*(){
	if(this.cycTemp && this.coTemp && this.cycTemp<=share.sensor('cycle') && this.coTemp>=share.sensor('co')){
		if(this.cycWork){
			share.setUnit('cycle', true);
			yield sleep(this.cycWork);
		}

		if(this.coStop){
			share.setUnit('cycle', true);
			yield sleep(this.cycStop);
		}
	} else {
		yield sleep(this.cycStop);
	}

	if(this.stop)
		return false;
}, programs);

//	CO WORK
var cou = new Cycle(function*(){
	if(this.coTemp && this.temp && this.coTemp<=share.sensor('co') && this.temp>share.sensor('inside')){
		if(this.coWork){
			share.setUnit('co', true);
			yield sleep(this.coWork);
		}

		if(this.coStop){
			share.setUnit('co', true);
			yield sleep(this.coStop);
		}
	} else {
		yield sleep(this.coStop);
	}

	if(this.stop)
		return false;
}, programs);

//	CWU WORK
var cwu = new Cycle(function*(){
	if(this.cwWork){
		share.setUnit('cwu', true);
		yield sleep(this.cwWork);
	}

	if(this.cwStop){
		share.setUnit('cwu', true);
		yield sleep(this.cwStop);
	}

	if(this.stop)
		return false;
}, programs);

//at last, load next and reload
function*(){
	var ret = yield db('schedule').where({
			day: day,
			stime: time
		}).andWhere(function(){
			this.where('date', date).orWhere('default', true);
		});


}















['start', 'active', 'update', 'accept', 'reject', 'sensors', 'sensor', 'unit', 'units', 'stop'].forEach(function(event){
	share.on(event, function(){
		console.log(share.options.name+':'+event, arguments);
	});
});

share.start();

share.on('update', function(){
	//TODO run cycle

	share.setRange({
		turbine: 40
	});2

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
//TODO insta
