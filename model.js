class Particle {
    constructor(name, image, mass = 1.0, dt = 0.06) {
        this.name = name;
        this.image = image;
        this.position = createVector(0,0);
        this.velocity = createVector(rand()/1000.0,rand()/1000.0);
        this.mass = mass;
        this.dt = dt;
    }

    update(force) {
        this.velocity.x += force.x*this.dt/this.mass;
        this.velocity.y += force.y*this.dt/this.mass;

        this.velocity.normalize();
        this.velocity.div(10.0);

        this.position.x += this.velocity.x*this.dt;
        this.position.y += this.velocity.y*this.dt;

        if (this.position.x > 1.0) {
            this.velocity.x *= -1.0;
            this.position.x = 1.0;
        }

        if (this.position.x < -1.0) {
            this.velocity.x *= -1.0;
            this.position.x = -1.0;
        }


        if (this.position.y > 1.0) {
            this.velocity.y *= -1.0;
            this.position.y = 1.0;
        }

        if (this.position.y < -1.0) {
            this.velocity.y *= -1.0;
            this.position.y = -1.0;
        }

    }
}

class Player extends Particle {
    constructor(name, image) {
        super(name, image);
    }

    init() {
        this.position.x = 0.0;
        this.position.y = 0.0;
    }
}

class Target extends Particle {
    constructor(name, image) {
        super(name, image);

        this.position = randAvoidCenter();
    }

    init() {
        this.position = randAvoidCenter();
    }
}


class Bonus extends Particle {
    constructor(name, image) {
        super(name, image);

        this.position = randAvoidCenter();
    }
}


class Enemy extends Particle {
    constructor(name, image) {
        super(name, image);

        this.position = randAvoidCenter();
    }
}


class Field {
    constructor(title) {
        this.title = title;
        this.stateTransitionFnc = _dynamics[0][0];
    }

    computeVector(x, y, u) {
        return this.stateTransitionFnc(x, y, u);
    }
}

class Dynamic {
    constructor(player, field, target, bonuses, enemies, dt) {
        this.player = player;
        this.field = field;
        this.target = target;
        this.bonuses = bonuses;
        this.enemies = enemies;
        this.dt = dt;
    }

    stepPlayer(u) {

        var x = this.player.position.x;
        var y = this.player.position.y;
        let dx = this.field.computeVector(x, y, u);

        x += dx[0]*this.dt;
        y += dx[1]*this.dt;

        x = constrain(x, -100.0, 100.0);
        y = constrain(y, -100.0, 100.0);

        this.player.position.x = x;
        this.player.position.y = y;

    }

    randomWalk(particles) {
        for (let i = 0; i<particles.length; i++) {
            let particle = particles[i];
            particle.update(createVector(rand(), rand()));
        }
    }


    testCollision(particle1, particle2, collisionCallback) {
        if ( particle1.position.dist(particle2.position) < 2.0*PARTICLE_SIZE ) {
            collisionCallback(particle1, particle2);
        }
    }


    testCollisionWithTarget(callback) {
        this.testCollision(this.player, this.target, callback); 
    }

    testCollisionWithBonuses(callback) {

        for (let i=0; i<this.bonuses.length; i++) {
            let bonus = this.bonuses[i];

            this.testCollision(this.player, bonus, callback); 
        }
    }



    testCollisionWithEnemies(callback) {

        for (let i=0; i<this.enemies.length; i++) {
            let enemy = this.enemies[i];

            this.testCollision(this.player, enemy, callback); 
        }
    }


}



class State {
    constructor() {
        this.points = 0;
        this.deaths = 0;
        this.targets = 0;
        this.land = 1;
        this.level = 1;

        this.game = 0;

        this.frame = 0;
    }  
    
    increaseLevel(callbackLevel, callbackLand, callbackGame) {
        this.level++;
        this.targets++;

        if (this.level > 4) {
            this.level = 1;
            this.land++;

            callbackLand(this);
        }

        if (this.land > 4) {
            this.land = 1;

            callbackGame(this);
        }

        this.points += _levelPoints;

        callbackLevel(this);
    }


    increaseBonusPoints() {
        this.points += _bonusPoints;

    }

    penalizeRestart() {
        this.points -= _bonusPoints;
    }

    increaseDeaths() {
        this.deaths += 1;
    }
}