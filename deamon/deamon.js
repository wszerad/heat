var System = require('../share/share.js'),
	share = new System(),
	conf = require('../share/config.js');

//konstruktor obiektu
var Unit = function(name, driver){
	//przypisanie wartosci początkowych
	this.name = name;
	this.driver = driver;
	this.nextState = false;
	this.lastChange = Date.now();
	this.timeout = null;
};
	
//nadanie metody	
Unit.prototype.setChange = function(state){
	var self = this,
		timeoutDiff = self.lastChange+conf.unitTimeout-Date.now(),
		//funkcja zwrotna przekazująca innym modułom informacje o dokonaniu zmiany stanu pinu
		cb = function(){
			share.setUnit(self.name, self.nextState);
		};
	
	//określenie kolejnego stanu pinu
	self.nextState = state;
	
	//jeżeli od ostatniej zmiany stanu upłynęło wystarczająco dużo czasu (zabezpieczenie zużycia przekaźników) dokonujemy natychmiastowej zmiany
	if(timeoutDiff<=0) {
		self.driver.write(self.nextState, cb);
	//inicjacja odliczania do zmiany po czasie
	} else if(self.timeout === null) {
		self.timeout = setTimeout(function(){
			//po zakończeniu odliczania dokonujemy zmiany stanu pinu 
			self.driver.write(self.nextState, cb);
			self.timeout = null;
		}, timeoutDiff);
	}
	//w przeciwnym wypadku określane jest jedynie "nextState" tak aby po zakończeniu odliczania zmienić stan na ostatni skonfigurowany
};
	
//ukryta mniej istotna część kodu	
...	
	
//nasłuch na zdarzenie zmiany stanu pracy silników
share.on('unit', function(name, state){
	//wybranie konkretnego silnika
	var unit = units[name];
	
	//jeżeli stan jest różny od obecnego inicjujemy zmianę poprzez metodę obiektu "Unit"
	if(unit.nextState !== state){
		units[unit].setChange(state);
	}
});
	
for(var i in sensors){
	sensor[i].on('change', function(sensor, temp){
		share.setSensor(sensor, temp);
	});
}	
		
	
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