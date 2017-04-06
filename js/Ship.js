const SPACESPEED_DECAY_MULT = 0.99 / SIXTY_FPS_IN_MS;
const THRUST_POWER = 0.075 / SIXTY_FPS_IN_MS;
const TURN_RATE = 0.015 / SIXTY_FPS_IN_MS;
const MULTIPLIER_LIFESPAN = 150 / SIXTY_FPS_IN_MS;
const SHIP_COLLISION_RADIUS = 30;

var shipCanMove = true;
var endScore;
var endWave;
var scoreMultiplier = 1;
var scoreMultiplierLifeSpan = MULTIPLIER_LIFESPAN;

Ship.prototype = new MovingWrapPosition();

function Ship() {

  this.cannon = new Cannon();

  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.verts = [];
  this.ang = 0;
  this.xv = 0;
  this.yv = 0;
  this.myShipPic; // which picture to use
  this.name = "Untitled Ship";

  this.keyHeld_Gas = false;
  this.keyHeld_Reverse = false;
  this.keyHeld_TurnLeft = false;
  this.keyHeld_TurnRight = false;

  this.keyHeld_Fire = false;

  this.controlKeyUp;
  this.controlKeyRight;
  this.controlKeyDown;
  this.controlKeyLeft;

  this.setupInput = function(upKey, rightKey, downKey, leftKey, shotKey) {
    this.controlKeyUp = upKey;
    this.controlKeyRight = rightKey;
    this.controlKeyDown = downKey;
    this.controlKeyLeft = leftKey;
    this.controlKeyForShotFire = shotKey;
  };

  this.superClassReset = this.reset;
  this.reset = function(whichImage) {
    this.superClassReset();
    this.myShipPic = whichImage;
    this.speed = 0;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.cannon.clearShots();
    this.ang = 0;
    this.xv = 0;
    this.yv = 0;
    this.keyHeld_Gas = false;
    this.keyHeld_Reverse = false;
    this.keyHeld_TurnLeft = false;
    this.keyHeld_TurnRight = false;
  }; // end of shipReset func

  this.isOverlappingPoint = function(testX, testY) {
    var deltaX = testX - this.x;
    var deltaY = testY - this.y;
    var dist = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var didHit = dist <= SHIP_COLLISION_RADIUS;
    return didHit;
  };

  this.checkMyShipCollisonAgainst = function(colliders) {
    for (var c = 0; c < colliders.length; c++) {
      if (colliders[c].isOverlappingPoint(this.x, this.y)) {
        if(testingCheats){
          console.log('player collison detected - cheatmode on!');
          return;
        }
        if (lives === 0) {
          resetGame();
        } //if the player runs out of lives, end the game
        else {
          resetRound();
          if (lives > 0) {
            lives--;
          }
        } //if lives > 0, reset the round
      } // check if the current collider is overlapping the ship
    } //loop through colliders
  }; //end of checkMyShipCollisonAgainst functions

  this.superClassMove = this.move;
  this.move = function(colliders) {

    if (scoreMultiplierLifeSpan > 0) {
      scoreMultiplierLifeSpan -= timestampDelta;
    }
    if (scoreMultiplierLifeSpan == 0) {
      scoreMultiplier = 1;
    }

    if (this.keyHeld_Gas && shipCanMove == true) {
      fuelUsed++;
      this.xv += Math.cos(this.ang) * THRUST_POWER * timestampDelta;
      this.yv += Math.sin(this.ang) * THRUST_POWER * timestampDelta;
    }
    if (this.keyHeld_TurnLeft && shipCanMove == true) {
      this.ang -= TURN_RATE  * timestampDelta * Math.PI;
    }
    if (this.keyHeld_TurnRight && shipCanMove == true) {
      this.ang += TURN_RATE * timestampDelta * Math.PI;
    }

    this.xv *= SPACESPEED_DECAY_MULT * timestampDelta;
    this.yv *= SPACESPEED_DECAY_MULT * timestampDelta;

    this.superClassMove();
    this.checkMyShipCollisonAgainst(colliders);
    //this.cannon.iterateThroughEnemyArray(colliders, this);
    this.cannon.iterateShotsandColliders(colliders, this);
  };

  this.superClassDraw = this.draw;
  this.draw = function() {
    this.cannon.drawShots(this.myShotArray);
    drawBitmapCenteredWithRotation(this.myShipPic, this.x, this.y, this.ang);
    this.superClassDraw();
  };
}
