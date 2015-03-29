var path = require('path'),
	$ = require('enderscore'),
	conf = require(path.join(__dirname, '../../share', 'config.js')),
	knex = conf.knex,
	currentStats;

var stats = exports.stats = function(){
	return currentStats;
};

var generateStats = exports.generateStats = function(){
	var date = new Date(),
		day = date.getDate(),
		min = date.getMinutes(),
		i = 0;

	currentStats = {
		turbineSpeed: (day<7)? 40 : 60,
		coWork: (min%20>5),
		coTemp: Math.round(50+Math.random()*20),
		cwuWork: (min%4>2),
		cwuTemp: Math.round(50+Math.random()*20),
		cycWork: min%2==1,
		cycTemp: Math.round(40+Math.random()*30),
		turbineWork: !(min%2==1),
		helixWork: !(min%4>2),
		helixTemp: Math.round(18+Math.random()*1),
		fuseTemp: Math.round(16+Math.random()*1),
		insideTemp: Math.round(20+Math.random()*2),
		time: date,
		m: min,
		level: 0,
		user: 'my'
	};
};

setInterval(function(){
	generateStats();

	var data = stats();

	conf.StatusKnex.insert($.pick(data, conf.StatusModel.getAttributes())).exec(function(){});
	conf.CommandKnex.insert($.pick(data, conf.CommandModel.getAttributes())).exec(function(){});
}, 1000);

//stats
/*
var data = [];

for(var day=0; day<14; day++){
	for(var hour=0; hour<24; hour++){
		for(var min=0; min<60; min++){
			data.push({
				time: new Date(2014, 10, 16+day, hour, min),
				type: 'stats',
				m: min,
				cycle: Math.round(40+Math.random()*30),
				co: Math.round(50+Math.random()*20),
				helix: Math.round(18+Math.random()*1),
				fuse: Math.round(16+Math.random()*1),
				inside: Math.round(20+Math.random()*2)
			});
		}
		db(conf.dbStatsT).insert(data).exec(function(){
			console.log(arguments);
		});
		data = [];
	}
}*/


/*
//comends
var data = [],
	i = 0;

for(var day=0; day<14; day++){
	for(var hour=0; hour<24; hour++){
		for(var min=0; min<60; min++){
			data.push({
				id: i++,
				time: new Date(2014, 10, 16+day, hour, min),
				owner: 'my',
				level: 1,
				turbine: (day<7)? 40 : 60,
				cycle: min%2==1,
				co: (min%20>5),
				helix: !(min%4>2),
				cwu: (min%4>2),
				fan: (min%10>5)
			});
		}
		db(conf.dbComT).insert(data).exec(function(){
			console.log(arguments);
		});
		data = [];
	}
}*/