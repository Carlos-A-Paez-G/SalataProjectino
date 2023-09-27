var simulationSize = 50;
var minSize = 20;
var maxSize = 50;
let time = 0;

let ParticleSystem = [];

let posA;
let posB;

let left;
let right;
let up;
let down;

let balls = [];
let pairs = [];

let impulse = 5;

function setup() {
	new Canvas(displayWidth, displayHeight);

	posA = createVector(0,0);
	posB = createVector(0,0);

	left = new Sprite(-2, displayHeight/2, 1, displayHeight);
	left.collider = 'static';
	right = new Sprite(displayWidth+2, displayHeight/2, 2, displayHeight);
	right.collider = 'static';
	up = new Sprite(displayWidth/2, -2, displayWidth, 1);
	up.collider = 'static';
	down = new Sprite(displayWidth/2, displayHeight+2, displayWidth, 1);
	down.collider = 'static';

	let pallette = [color(206, 234, 247), color(229, 61, 0), color(137, 99, 186), color(255, 212, 71), color(104, 139, 88)];

	for(let i = 0; i < simulationSize; i++) {
		balls[i] = new Sprite(random(50, displayWidth-50), random(50, displayHeight-50),
						random(minSize, maxSize));
		balls[i].bounciness = random(0.3, 1);
		balls[i].vel.x = random(-5, 5);
		balls[i].vel.y = random(-5, 5);
		balls[i].strokeWeight = 0;
		var c = pallette[floor(random(0,5))];
		console.log(c);
		balls[i].color = c;
	}
	
	for(let i = 0; i < simulationSize; i++) {
		pairs[i] = [i, floor(random(0,simulationSize))];
	}

}

function draw() {
	background('black');

	time++;

	if (time >= 1200) {
		for(let i = 0; i < simulationSize; i++) {
			pairs[i] = [i, floor(random(0,simulationSize))];
		}
		time = 0;
	}

	for(let i = 0; i < simulationSize; i++) {

		// if(balls[i].collides(right)) {
		// 	console.log('hi');
		// 	balls[i].x = 0;
		// } 
		

		let j = pairs[i][0];
		let k = pairs[i][1];
		
		attract(balls[j], balls[k]);

		posA.x = balls[j].x;
		posA.y = balls[j].y;
		posB.x = balls[k].x;
		posB.y = balls[k].y;

		if(balls[j].colliding(balls[k])) {
			console.log(balls[j]);
			balls[j].diameter += 10;
			balls[j].diameter = constrain(balls[j].diameter, 5, 200);
			balls[k].diameter -= 10;
			balls[k].diameter = constrain(balls[k].diameter, 5, 200);


		}

	// 	if(dist(posA, posB) < maxSize*2) {
	// 		repel(balls[j], balls[k]);
	// 	}
	}

	// for(p in ParticleSystem) {
	// 	console.log(ParticleSystem[p]);
	// 	ParticleSystem[p].exist();


	// }

	// //////debuggggg
	// if(kb.presses(' ')) {
	// 		var mouse = createVector(mouseX, mouseY);
	// 		ParticleSystem.push(new Psys(balls[0], mouse));
	// 		console.log(ParticleSystem);
	// 	}
}



function attract(a, b) {
	// var f = createVector(b.x - a.x, b.y - a.y);
	// a.applyForce(impulse, f);

	a.attractTo(b.x, b.y, impulse);
}

function repel(a, b) {
	push();
	var ix = -b.x;
	var iy = -b.y;
	a.attractTo(impulse*5000000, ix, iy);
	pop();
}

/* get midpoint normal! :)                                                                                   
0.- Make copies of the positions so ya don't kill themmm
1.- Subtract both positions - this gives you the distance btwn the two
2.- Divide this result by two
That's your midpoint!

3.- Make a new vector - the x = y of the result, the y = -x of the result
That's your midpoint normal!

4.- When drawing, make sure to do 2 translates:
4.1 - to the starting position
4.2 - to the midpoint
5.- then everything will happen from the midpoint normal
*/
function midpointNormal(a, b) {
	var midpoint = b.copy();

	midpoint.sub(a);
	midpoint.div(2);
	midpoint.add(a);

	var normal = createVector(midpoint.y, -1*midpoint.x);
	normal.normalize();

	return midNormal = [midpoint, normal];
}


class Psys {
	constructor(_a, _b) {
		this.midNormal = midpointNormal(_a, _b);
		this.origin = createVector(_a.x, _a.y);
		this.parts = [];
		this.size = floor(random(10,20));

		for(let i=0; i < this.size; i++) {
			var dxy = createVector(random(0.5, 15), random(0.1, 8));
			if(this.size % 2) {
				dxy.mult(-1);
			}

			var ddx = dxy.x * -0.01;
			var ddy = dxy.y * -0.01; 
			var c = 'white';
			this.parts[i] = new Particle(this.midNormal[0].x, this.midNormal[0].y, dxy.x, dxy.y, ddx, ddy, 100000, c);
		}
	}

	dead() {
		if(!this.parts.length) {
			return true;
		}
		return false;
	}

	exist() {
		fill(255,0,0);
		circle(this.midNormal[0].x, this.midNormal[0].y);
		fill(0,0,255);
		circle(this.midNormal[1].x, this.midNormal[1].y);

		for(let i=0; i < this.parts.length; i++) {
			this.parts[i].update();
			this.parts[i].exist();

			if(this.parts[i].dead()) {
				this.parts.splice(i, 1);
			}
		}
	}
}

class Particle {
	constructor (_x, _y, _dx, _dy, _ddx, _ddy, _life, _c) {
		this.pos = createVector(_x, _y);
		// this.x = _x;
		// this.y = _y;
		this.dx = _x;
		this.dy = _dy;
		this.ddx = _ddx;
		this.ddy = _ddy;
		this.life = _life;
		this.c = _c;
		this.s = random(1,3);
	}

	dead() {
		if(this.life < 0) {
			return true;
		}
		return false;
	}

	update() {
		this.dx += this.ddx;
		this.dy += this.ddy;
		this.x += this.dx;
		this.y += this.dy;
	
		this.life--;
	}

	exist() {
		stroke(this.c);
		strokeWeight(this.s);
		point(this.pos);
	}
}