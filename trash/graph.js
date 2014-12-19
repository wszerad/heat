
/*
 var Graph = function(){
 var c = $('#graph > canvas');

 this.opt = {
 bg: c[1].getContext('2d'),
 bgs: {
 width: '1px',
 cap: 'round',
 join: 'round'
 },
 graph: c[0].getContext('2d'),
 graphs: {
 visibility: 0.5,
 colors: [[0,0,255], [0,128,255], [0,255,255], [0,255,128], [0,255,0], [128,255,0], [255,255,0], [255,128,0], [255,0,0], [255,0,128], [255,0,255], [128,128,128], [255,255,255]]
 },
 x: 800,
 y: 600,
 boolS: 2,
 scaleX: 80,
 scaleY: 60,
 step: 20,
 max: 100,
 cache: {
 bools: 0,
 last: null
 }
 };

 this.toRGBA = function(rgb, a){
 a = a || 1;
 return 'rgba('+rgb.join(',')+','+a+')';
 };

 this.createBackground = function(bools){
 var opt = this.opt;

 //style
 opt.bg.lineWidth = opt.bgs.width;
 opt.bg.lineCap = opt.bgs.cap;
 opt.bg.lineJoin = opt.bgs.join;

 for(var y=0; y<opt.y; y+=opt.scaleY){
 opt.bg.moveTo(0, y);
 opt.bg.lineTo(opt.x, y);
 opt.bg.stroke();
 }

 for(var x=0; x<opt.x; x+=opt.scaleX){
 opt.bg.moveTo(x, 0);
 opt.bg.lineTo(x, opt.y);
 opt.bg.stroke();
 }
 };

 this.draw = function(){
 var self = this,
 opt = this.opt,
 args = $.makeArray(arguments),
 bools = -1;

 if(!opt.cache.last){
 args.forEach(function(data){
 if(!$.isNumeric(data))
 opt.cache.bools++;
 });

 this.createBackground(opt.cache.bools);
 }else{
 //self.step();
 opt.graph.save();
 opt.graph.translate(opt.step, 0);
 args.forEach(function(data, index){
 var y;

 if($.isNumeric(data)){
 y = Math.round(opt.cache.last[index]/opt.max*opt.y);
 opt.graph.strokeStyle = self.toRGBA(opt.graphs.colors[index]);
 } else {
 y = ++bools*opt.boolS;
 opt.graph.strokeStyle = self.toRGBA(opt.graphs.colors[index], !data*opt.graphs.visibility);
 }


 opt.graph.beginPath();
 opt.graph.moveTo(0, y);

 if($.isNumeric(data)){
 y = Math.round(data/opt.max*opt.y);

 }else{
 y = bools*opt.boolS;

 }


 opt.graph.lineTo(opt.step, y);
 opt.graph.stroke();
 //opt.graph.restore();
 });

 }

 opt.cache.last = args;
 };

 this.step = function(){
 var opt = this.opt;

 opt.graph.save();
 opt.graph.translate(100, 0);
 opt.graph.restore();

 //buff.drawImage(opt.graphRAW, 0, 0, opt.x-opt.step, opt.y, opt.step, 0, opt.x-opt.step, opt.y);
 //opt.graph.clearRect(0, 0, opt.x ,opt.y);
 //opt.graph.drawImage(c2, 0, 0, opt.x, opt.y, 0, 0, opt.x, opt.y);
 //buff.clearRect(0,0,opt.x,opt.y);
 }
 };

 function start(){
 graph = new Graph();
 graph.draw(0, 70);
 graph.draw(10, 50);
 graph.draw(20, 40);
 graph.draw(90, 30);
 }*/