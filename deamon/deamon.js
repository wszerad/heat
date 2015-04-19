var Share = require('../share/share.js'),
	share = Share.System(),
	conf = require('../share/config.js'),
	Unit = require('./Unit.js')(share),
	security = require('./security.js'),
	securityCheck = security.securityCheck,
	register = security.register,
	pidriver = require('../util/pidriver/pidriver.js'),
	units = {},
	sensors = {},
	sensorsPin = {},
  sensorsFix = {},
	currSensor = 0,
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
	}, ['PWM','pin'])
	.forEach(function(unit){
		var timeout = conf.unitTimeout,
			driver;

		if(unit.PWM){
			driver = unit.pin.map(function(num){
				return Expander.subPins[num];
			})
		} else {
			driver = Expander.subPins[unit.pin];
		}

		units[unit.name] = new Unit(unit.name, driver, {timeout: timeout});
	});

//init sensors
conf.StatusModel.getViews(function(sensor){
		return !!sensor.show;
	}, ['pin','fix'])
	.forEach(function(sensor){
		sensors[sensor.name] = 0;
    sensorsFix[sensor.name] = sensor.fix;
		sensorsPin[sensor.name] = sensor.pin;
	});

//watch temp interval
setInterval(function(){
	var sensorList = Object.keys(sensors),
		sensorPin = sensorsPin[sensorList[currSensor]],
		spir = SPI.read(sensorPin)+sensorsFix[sensorList[currSensor]],
		temp;

  if(spir>600)
      temp = -1;
  else if(spir>510)
      temp = 0;
  else
     	temp = Math.round(Math.sqrt(1-spir/512)*120);

  share.setSensor(sensorList[currSensor], temp);

	var msgs = securityCheck();
	msgs.stack.forEach(function(msg){
		share.sendEvent('warning', msg);
		share.log('error', msg);
	});

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
		unit.setChange(state);
	}
});

//security checks
register([units['cycWork'], units['alert']], [units['turbineWork'], units['helixWork']], function(){
	return share.sensor('cycTemp')>90;
}, 'Temperatura pieca przekroczona!');

register([units['cycWork'], units['coWork'], units['alert']], [units['turbineWork'], units['helixWork']], function(){
	return share.sensor('coTemp')>90;
}, 'Temperatura zbiornika przekroczona!');

register([units['alert']], [units['turbineWork'], units['helixWork']], function(){
	return share.sensor('helixTemp')>70;
}, 'Temperatura podajnika niebezpiecznie wysoka!');