var inMode = false;

var lcdSymulator = function(cols, rows){
	var self = this;

	this.buffers = [];
	this.position = [0, 0];
	this.cb = null;
	this.opts = {
		cols: cols,
		rows: rows
	};

	while(rows--){
		this.buffers.push(new Buffer(cols));
	}

	if(!inMode){
		process.stdin.resume();
		process.stdin.setRawMode(true);

		process.stdin.on('data', function(data){
			if(data[0]*1 === 27){
				if(data.length === 1)
					process.exit();

				if(data[1]*1 === 91){
					switch (data[2]*1){
						case 65:
							self.cb('ok');
							break;
						case 66:
							self.cb('close');
							break;
						case 67:
							self.cb('next');
							break;
						case 68:
							self.cb('prev');
							break;
						case 51:
							console.log('\033c');
							break;
					}
				}
			}
		});
	}
};

lcdSymulator.prototype.write = function(data){
	var self = this,
		len;

	data = data.toString();

	len = self.buffers[self.position[1]].write(data, self.position[0]);
	self.setPosition(self.position[0]+len, self.position[1]);

	self.clear();

	self.buffers.forEach(function(buff){
		console.log(buff.toString());
	});
};

lcdSymulator.prototype.setPosition = function(x, y){
	this.position = [x, y];
};

lcdSymulator.prototype.clear = function(){
	//console.log('\033c');
};

lcdSymulator.prototype.onkey = function(cb){
	this.cb = cb;
};

exports.LCD = lcdSymulator;