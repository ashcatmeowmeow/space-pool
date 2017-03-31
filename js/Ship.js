const SPACESPEED_DECAY_MULT = 0.99;
const THRUST_POWER = 0.075;
const TURN_RATE = 0.015;
const SHIP_COLLISION_RADIUS = 30;

var endScore;
var endWave;
const Stat = require("./Stats");
const config = require("./config");
var scoreMultiplierLifeSpan = config.MULTIPLIER_LIFESPAN;
const MovingWrapPosition = require("./MovingWrapPosition");
const Cannon = require("./Cannon");
const Input = require("./Input");
const Graphics = require("./GraphicsCommon");

var canvas = document.getElementById('gameCanvas');
Ship.prototype = new MovingWrapPosition();

function Ship() {

  this.cannon = new Cannon();

  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
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
        if(config.testingCheats){
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

    if (Stat.scoreMultiplierLifeSpan > 0) {
      Stat.scoreMultiplierLifeSpan--;
    }
    if (Stat.scoreMultiplierLifeSpan == 0) {
      Stat.scoreMultiplier = 1;
    }

    if (this.keyHeld_Gas) {
      Stat.fuelUsed++
      this.xv += Math.cos(this.ang) * THRUST_POWER;
      this.yv += Math.sin(this.ang) * THRUST_POWER;
    }
    if (this.keyHeld_TurnLeft) {
      this.ang -= TURN_RATE * Math.PI;
    }
    if (this.keyHeld_TurnRight) {
      this.ang += TURN_RATE * Math.PI;
    }

    this.xv *= SPACESPEED_DECAY_MULT;
    this.yv *= SPACESPEED_DECAY_MULT;

    this.superClassMove();
    this.checkMyShipCollisonAgainst(colliders);
    //this.cannon.iterateThroughEnemyArray(colliders, this);
    this.cannon.iterateShotsandColliders(colliders, this);
  };

  this.draw = function() {
    this.cannon.drawShots(this.myShotArray);
    Graphics.drawBitmapCenteredWithRotation(this.myShipPic, this.x, this.y, this.ang);
  };
}

module.exports = Ship;
