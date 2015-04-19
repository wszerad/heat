var Share = require('../share/share.js'),
	share = Share.System(),
	Command = Share.Command,
	CurrCommand = null,
	Promise = require('bluebird'),
	conf = require('../share/config.js');

var program = {
		insideTemp: 20,
		cycTemp: 70,
		coTemp: 50,
		cwuTemp: 50,
		helixWork: 5,
		helixStop: 12,
		helixOffStop: 15,
		turbineWork: 1,
		turbineSpeed: '60',
		cycWork: 2,
		cycStop: 8,
		coWork: 2,
		coStop: 8,
		cwuWork: 2,
		cwuStop: 8,
		cwuCycleWork: 2,
		cwuCycleStop: 8
	},
	hasProgram = false,
	minimalLoopTime = 10;

var start = function(obj){
	var time;

	if(obj.lastStart===null)
		time = 0;
	else
		time = Math.abs(Math.min(Date.now()-obj.lastStart-minimalLoopTime*1000, 0));

	obj.lastStart = Date.now()+time;
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			if(!hasProgram) {
				reject();
				CurrCommand.stop();
			} else {
				if(CurrCommand && CurrCommand.active)
					CurrCommand.stop();

				CurrCommand = Command();
				CurrCommand.active = true;

				resolve();
			}
		}, time);
	});
};

var delay = function(time){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			resolve();
		}, time*1000);
	});
};

var antyOverLoop = function(){
	return {
		lastStart: null
	}
};

//heating
var heatingOverloop = antyOverLoop();
var heating = function(){
	start(heatingOverloop)
		.then(function(){
			CurrCommand.setUnit('turbineSpeed', program.turbineSpeed);
			if(program.helixWork)
				CurrCommand.setUnit('helixWork', true);

			return program.helixWork;
		})
		.then(delay)
		.then(function(){
			CurrCommand.setUnit('helixWork', false);

			if(program.cycTemp && share.sensor('cycTemp')<program.cycTemp){
				CurrCommand.setUnit('turbineWork', true);
				return program.helixStop;
			} else {
				CurrCommand.setUnit('turbineWork', false);
				return program.helixOffStop;
			}
		})
		.then(delay)
		.finally(function(){
			//rerun
			loadProgram();
			heating();
		})
};

//cycle
var cycleOverloop = antyOverLoop();
var cycle = function(){
	start(cycleOverloop)
		.then(function(){
			if(program.cycWork && program.cycTemp<=share.sensor('cycTemp') && program.coTemp>=share.sensor('coTemp')){
					CurrCommand.setUnit('cycWork', true);
					return program.cycWork;
			}
			return 0;
		})
		.then(delay)
		.then(function(){
			CurrCommand.setUnit('cycWork', false);
			return program.cycStop;
		})
		.then(delay)
		.finally(function(){
			//rerun
			cycle();
		});
};

//CO WORK
var coOverloop = antyOverLoop();
var co = function(){
	start(coOverloop)
		.then(function(){
			if(program.coWork && program.coTemp<=share.sensor('coTemp') && program.insideTemp>share.sensor('insideTemp')){
					CurrCommand.setUnit('coWork', true);
					return program.coWork;
			}
			return 0;
		})
		.then(delay)
		.then(function(){
			CurrCommand.setUnit('coWork', false);
			return program.coStop;
		})
		.then(delay)
		.finally(function(){
			//rerun
			co();
		});
};

//CWU
var cwuOverloop = antyOverLoop();
var cwu = function(){
	start(cwuOverloop)
		.then(function(){
			if(program.cwuWork && program.coTemp<=share.sensor('coTemp') && program.cwuTemp>share.sensor('cwuTemp')){
				CurrCommand.setUnit('cwuWork', true);
				return program.cwuWork;
			}
			return 0;
		})
		.then(delay)
		.then(function(){
			CurrCommand.setUnit('cwuWork', false);
			return program.cwuStop;
		})
		.then(delay)
		.finally(function(){
			cwu();
		});
};


//CWU cycle
var cwuCycleOverloop = antyOverLoop();
var cwuCycle = function(){
	start(cwuCycleOverloop)
		.then(function(){
			if(program.cwuCycleWork && program.cwuTemp<=share.sensor('cwuTemp')){
				CurrCommand.setUnit('cwuCycleWork', true);
				return program.cwuCycleWork;
			}
			return 0;
		})
		.then(delay)
		.then(function(){
			CurrCommand.setUnit('cwuCycleWork', false);
			return program.cwuCycleStop;
		})
		.then(delay)
		.finally(function(){
			cwuCycle();
		});
};

function loadProgram(){
	return new Promise(function(resolve, reject){
		var date = new Date(),
			day = date.getDay(),
			time = date.getHours()*60+date.getMinutes();

		conf.knex
			.raw('select p.* from programs p, events e, schedules s WHERE "p"."id" = "e"."program_id" AND "e"."start"<=? AND "e"."day" = ? AND "e"."schedule_id" = "s"."id" AND "s"."active" = 1 ORDER BY "e"."start" DESC LIMIT 1', [time, day])
			.then(function(data){
				if(!data.length)
					hasProgram = false;
				else{
					program = data[0];
					hasProgram = true;
				}

				resolve()
			})
			.catch(reject);
	});
}

share.on('active', function(){
	loadProgram().then(function(){
		heating();
		cycle();
		co();
		cwu();
		cwuCycle();
	});
});

share.on('program', loadProgram);

share.on('schedule', loadProgram);

share.start();