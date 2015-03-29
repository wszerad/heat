module.exports = function(sensors, units){
	var active = false,
		msg = false;

	if(sensors['cycTemp']>90){
		active = true;
		msg = 'Temperatura pieca przekroczona!';
		//units['alert'].seciurityBlock(true);
		units['cycWork'].seciurityBlock(true);
		units['turbineWork'].seciurityBlock(false);
		units['helixWork'].seciurityBlock(false);
	} else if(!active){
		//units['alert'].seciurityBlock(false);
		units['cycWork'].seciurityUnblock();
		units['turbineWork'].seciurityUnblock();
		units['helixWork'].seciurityUnblock();
	}

	if(sensors['coTemp']>90){
		active = true;
		msg = 'Temperatura zbiornika przekroczona!';
		//units['alert'].seciurityBlock(true);
		units['cycWork'].seciurityBlock(true);
		units['coWork'].seciurityBlock(true);
		units['turbineWork'].seciurityBlock(false);
		units['helixWork'].seciurityBlock(false);
	} else if(!active){
		//units['alert'].seciurityBlock(false);
		units['cycWork'].seciurityUnblock();
		units['coWork'].seciurityUnblock();
		units['turbineWork'].seciurityUnblock();
		units['helixWork'].seciurityUnblock();
	}

	if(sensors['helixTemp']>70){
		active = true;
		msg = 'Temperatura podajnika niebezpiecznie wysoka!';
		//units['alert'].seciurityBlock(true);
		units['turbineWork'].seciurityBlock(false);
		units['helixWork'].seciurityBlock(false);
	} else if(!active){
		//units['alert'].seciurityBlock(false);
		units['turbineWork'].seciurityUnblock();
		units['helixWork'].seciurityUnblock();
	}

	if(sensors['fuseTemp']>70){
		active = true;
		msg = 'Temperatura topnika przekroczona!';
	//	units['alert'].seciurityBlock(true);
		units['turbineWork'].seciurityBlock(false);
		units['helixWork'].seciurityBlock(false);
	} else if(!active){
		//units['alert'].seciurityBlock(false);
		units['turbineWork'].seciurityUnblock();
		units['helixWork'].seciurityUnblock();
	}

	return msg || false;
};