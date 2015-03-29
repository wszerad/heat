var Share = require('../share/share.js'),
	share = Share.System(),
	conf = require('../share/config.js'),
	Unit = require('./Unit.js')(share),
	pidriver = require('../util/fakepidriver.js'),
	securityCheck = require('./securityCheck.js'),
	units = {},
	sensors = {},
	PWMTable = {
		0: [0,0,0,0,0],
		20: [1,0,0,0,0],
		40: [1,1,0,0,0],
		60: [1,1,1,0,0],
		80: [1,1,1,1,0],
		100: [1,1,1,1,1]
	},
	currSensor = 0,
	unitIndex = 0,
	started = false,
	Expander = new pidriver.MCP23s17(1),
	SPI = new pidriver.SPI(0, {
		preBuffering: function(buff, arg){
			buff.writeUInt8(1, 0);
			buff.writeUInt8((8+arg)<<4, 1);
			buff.writeUInt8(0, 2);
			return buff;
		},
		postBuffering: function(buff, arg){
			return ((buff[1]&15)<<8) + buff[2];
		}
	});

//init units
conf.CommandModel.getViews(function(unit){
		return !!unit.isParameter;
	}, ['PWM'])
	.forEach(function(unit){
		var timeout = conf.unitTimeout,
			driver;

		if(unit.PWM){
			driver = [0, 1, 2, 3, 4, 5].map(function(num){
				return Expander.subPins[(unitIndex++)+num];
			})
		} else {
			driver = Expander.subPins[unitIndex++];
		}

		units[unit.name] = new Unit(unit.name, driver, {timeout: timeout});
	});

//init sensors
conf.StatusModel.getViews(function(sensor){
		return !!sensor.show;
	}, [])
	.forEach(function(sensor){
		sensors[sensor.name] = 0;
	});

//watch temp interval
setInterval(function(){
	var sensorList = Object.keys(sensors);
	//TODO resistance to temp conventer
	share.setSensor(sensorList[currSensor], Math.round(SPI.read(currSensor)));

	var msg = securityCheck(share.sensorAll(), units);
	if(msg){
		share.sendEvent('warning', msg);
		share.log('error', msg);
	}

	if(++currSensor === sensorList.length){
		currSensor = 0;
		if(!started){
			started = true;
			share.start();
		}
	}
}, 1000);

//watch for unit changes
share.on('unit', function(name, state){
	var unit = units[name];

	if(unit.nextState !== state){
		if(unit.PWM){
			unit.setChange(PWMTable[state]);
		} else {
			unit.setChange(state);
		}
	}
});