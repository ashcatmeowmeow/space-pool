const NUMBER_OF_SHOTS = 1;

function Cannon() {
  this.shotArray = [];

  this.clearShots = function() {
    this.shotArray = [];
  };

  this.cannonFire = function(ship) {
    if (this.shotArray.length < NUMBER_OF_SHOTS) {
      if (railGunActive) {
        var tempShot = new RailSlug();
      }
      Sound.volume('sfx_laser', 0.2);
      Sound.play('sfx_laser');
      this.shotArray.push(tempShot);
      tempShot.reset();
    }
  };

  this.iterateShotsandColliders = function(colliders, ship) {
    this.iterateThroughShotArray(colliders, ship);
    this.removeDeadShots(this.shotArray);
  };

  this.iterateThroughShotArray = function(colliders, ship) {

    for (var i = 0; i < this.shotArray.length; i++) {
      if (this.shotArray[i].isShotReadyToFire()) {
        this.shotArray[i].shootFrom(ship);
      }

      for (var currentCollider = 0; currentCollider < colliders.length; currentCollider++) {
        //checkCollisionShapes(shape1, shape2)
        if (colliders[currentCollider].invincibilityTimer == 0 && checkCollisionShapes(this.shotArray[i], colliders[currentCollider])) {

          colliders[currentCollider].hp -= this.shotArray[i].attackValue;
          if(colliders[currentCollider].isLargeAsteroid == true){
            largeAsteroidsDestroyedThisWave++;
            largeAsteroidsDestroyedThisRound++;
          }
          if (colliders[currentCollider].hp < 0) {
            this.shotArray[i].countdownTimeUntilCanHitAgain();
            colliders[currentCollider].explode();
            createParticles(this.shotArray[i].x, this.shotArray[i].y, 20, 5.0);
          }

          //allows 2nd wrapped shot to keep going
          if (colliders[currentCollider].radius >= ASTEROID_MIN_RADIUS_TO_EXPLODE_INTO_ASTEROIDS && scoreMultiplier != 4) {
            this.shotArray[i].reset();
            shipCanMove = true;
          }

          score += 100 * scoreMultiplier;
        } //rail collision check
      }//loop through colliders
      if (this.shotArray[i].shotLife > 0) {
        this.shotArray[i].move();
      }
    }
  };

  this.removeDeadShots = function() {
    for (var i = this.shotArray.length - 1; i >= 0; i--) {
      if (this.shotArray[i].shotLife < 1) {
        this.shotArray.splice(i, 1);
      }
    }
  };

  this.drawShots = function() {
    for (var i = 0; i < this.shotArray.length; i++) {
      if (this.shotArray[i].shotLife > 0) {
        this.shotArray[i].draw();
      }
    } //loop though shots
  } //drawShots
} //end of Canon function
