
function preload() {

  // float font image characters
  for (k in fontImgs) {
    var name = k;
    if (fontImgs[k] !== undefined) 
      name = fontImgs[k];
    fontImgs[k] = loadImage('images/font/' + name + '.png');
  }

  // load image assets
  enemyImage = loadImage('images/bomb.png');
  targetImage = loadImage('images/target.png');
  bonusImage = loadImage('images/bonus.png');
  playerImage2 = loadImage('images/res1.png');
  playerImage1 = loadImage('images/cross.png');
  arrowImage = loadImage('images/arrow_small.png');
  bgImage = loadImage('images/bg1_iphone.png');


  // load sounds  
  soundFormats('mp3', 'wav');
  sounds.bonus = loadSound('sounds/cash.wav');
  sounds.target = loadSound('sounds/ovation.wav');
  sounds.death = loadSound('sounds/lol.wav');
  sounds.beep = loadSound('sounds/beep.wav');
}




/*
  toggle music and sounds on and off. 
  - change icon acordingly
  - force is used when we need to call play again even it the sound is on (for instance if 
    a dialog might or might appear and we need to make sure that the second time we do not pause)
*/
function playBgMusic(force) {

    if (!sounds.bgMusic.isPlaying() || force) {
        $('#soundImg').attr('src','images/sound.png');
        sounds.bgMusic.loop();
    } else {
        $('#soundImg').attr('src','images/no_sound.png');
        sounds.bgMusic.stop();
    }
}


/*
loads the music for the current stage
*/
function loadBgMusic(state) {
  if (sounds.bgMusic)
    sounds.bgMusic.stop();

  $('#soundImg').attr('src','images/no_sound.png');

  sounds.bgMusic = loadSound('sounds/stage'+((state.land-1)*4 + state.level)+'.mp3', ()=>{
    $('#soundImg').show();
    playBgMusic(true);
  });

}


/* toggle pause
  -- changes icon accordingly
*/
function setPause() {
  if (PAUSE) {
    $('#pauseButton').css('-webkit-filter','grayscale(100%)');
    $('#pauseButton').css('filter','grayscale(100%)');
  } else {
    $('#pauseButton').css('-webkit-filter','grayscale(0%)');
    $('#pauseButton').css('filter','grayscale(0%)');
  }
  PAUSE = !PAUSE;
}


/*
event for restarting the the character
- pauses and init player position after a dialog
*/
function restartButtonClicked() {
  setPause();

  showDialog('go!', state, 'images/goo.png', ()=>{
    // restartLevel('-10 points...', true); 
    player.init();
  })    

}



/*
event for going back to main menu
*/
function backButtonClicked() {
  window.location = 'index.html';
}



  

/*
event for toggle auto pilot
*/
function setAutoPilot() {
  if (autoPilot) {
    $('#autoPilotImg').css('-webkit-filter','grayscale(100%)');
    $('#autoPilotImg').css('filter','grayscale(100%)');
  } else {
    $('#autoPilotImg').css('-webkit-filter','grayscale(0%)');
    $('#autoPilotImg').css('filter','grayscale(0%)');
  }

  autoPilot = !autoPilot;

  console.log(autoPilot);
}

  
// init bonuses (overwrite objects and create new ones)
function initBonuses() {
  bonuses = [new Bonus('','',10.0, _dt),  new Bonus('','',10.0, _dt), new Bonus('','',10.0, _dt)];
  dynamic.bonuses = bonuses;
}

// init enemies (overwrite objects and create new ones)
// - create as many enemies as games beaten...
function initEnemies() {

  let game = state.game;

  enemies = [];
  for (let i=0; i<game; i++) {
    enemies.push(new Enemy('',enemyImage,10.0, _dt) );
  }

  dynamic.enemies = enemies;
}



/*
restart level.
- wasuser differentiates between button click restart and auto restarts (death, level up, etc)
- remodel the whole screen and states
*/
function restartLevel(wasUser = false) {

  // if user asks it, take out some points
  if (wasUser) {
    state.penalizeRestart();
  }

  // configure field transition function
  field.stateTransitionFnc = _dynamics[state.land-1][state.level-1];

  // configure background
  changeBackground(state);

  // reset joystick
  joystick.value = 0.0;
  $('#sliderJoystick').slider('value', 0.0);

  // pause
  PAUSE = true;

  // reslocate player
  player.init();

  // relocate target
  target.position = randAvoidCenter();

  // relocate all enemies
  enemies.forEach(element => {
    element.position = randAvoidCenter();
  });

  // relocate all bonuses
  bonuses.forEach(element => {
    element.position = randAvoidCenter();
  });
  
}



// manage collision with target
//  p1 is always player and p2 is always target
function targetCollision(p1, p2) {
  sounds.target.play();

  // initialize everything
  initBonuses();
  initEnemies();

  // increase level and answer wo all callbacks
  state.increaseLevel(

    (newState) => {
      field.stateTransitionFnc = _dynamics[newState.land-1][newState.level-1];

      saveGameData();
      
      PAUSE = true;

      if (state.level > 1) {
        showDialog('', state, '', ()=>{
          restartLevel('huru!!', false); 
          loadBgMusic(state);
        });
      }
      
    }, 
    (newState) => {

      showImageDialog(_landCompleteImages[state.land-2], ()=>{
        window.location = 'map.html';
      });


    }, 
    (newState) => {
      state.game += 1;

      saveGameData();
    }
  );

}

// manage collision with target
//  p1 is always player and p2 is the collided bonus
function bonusCollision(p1, p2) {
  
  sounds.bonus.play();
      
  // take out the collected bonus
  bonuses = bonuses.filter((e)=>{return e != p2;});
  dynamic.bonuses = bonuses;

  // accumulate the points
  state.increaseBonusPoints();

}



// manage collision with enemy
//  p1 is always player and p2 is the collided enemy
function enemyCollision(p1, p2) {

  sounds.death.play();

  // pause the game and show a dialog (repositionign the player)
  PAUSE = true;
  showDialog('', state, 'images/lose.png', ()=>{
    initEnemies();
    target.init();
  });

  // add a death to the count
  state.increaseDeaths();

}


function setupJoystick() {
  joystick.element = $('#sliderJoystick');
  joystick.element.slider({
      orientation: "vertical",
      min: -uMax,
      max: uMax,
      step: 0.01,
      value: 0.0,
      slide: function( event, ui ) {
          joystick.value  = ui.value;
      }
  });  
 
}









/*
Initial setup:

- init canvas
- create assets objects (player, target, etc...)
*/
function setup() {

 

  // p5 stuff
  CANVAS = createCanvas(SCREEN_SIZE_W, SCREEN_SIZE_H);
  CANVAS.parent("mainCanvas");  
  frameRate(60); 


  // setup joystick
  setupJoystick();


  // init assets (after load game data)
  target = new Target('goal', '',10.0, _dt);
  field = new Field('LinearLand 1.0');
  player = new Player(0, '', 1.0, _dt);
  dynamic = new Dynamic(player, field, target, [], [], _dt, state);
  // load game data from local storage
  loadGameData();   

  
  initBonuses();
  initEnemies();
  
  renderer = new Renderer(CANVAS, dynamic);


  // "start" level (game will be paused)
  restartLevel(false);


  // show dialog and unpause
  showDialog('go!', state, '', ()=>{
    sounds.beep.play();
    
    setPause();  
    
    loadBgMusic(state);
  })    

}


  
function draw() {

  // draw everything
  clear();

  renderer.drawField(joystick.value);
  renderer.drawEnemies();
  renderer.drawBonuses();
  renderer.drawTarget();

  renderer.drawPlayer();

  renderer.drawDashboard(state);



  /*
   draw track if not in auto pilot
   draw the forecast for a SINGLE control signal...
   thats why we have a separate drawPositions for auto-pilot on or off
   */
  if (!autoPilot) {
    positions = futurePositions(player.position.x, player.position.y, [joystick.value], field.stateTransitionFnc, 100, 2*_dt);
    drawPositions(positions);
  }




  if (!PAUSE) {

    state.frame += 1;

    //console.log(frame);

    //[-5.2*x + 2.5*y + 3.2*u, -9*x - 0.8*y + 5.0*u];
/*      
    KP = 10.0;
    KI = 5.5;

    u = joystick.value;
    a11 = -5.2;
    a12 =  2.5;
    b1 = 3.2;
    a21 =-9;
    a22 = - 0.8;
    b2 = 5.0;
    x1s = target.position.x;
    x2s = target.position.y;
    x1 = player.position.x;
    x2 = player.position.y;
*/

/*
    stateError1 = x1s - x1;
    stateError2 = x2s - x2;

    dStateError1 = stateError1 - stateError1N_1;
    dStateError2 = stateError2 - stateError2N_1;

    uStar += KP*(dStateError1 + dStateError2)/2 + KI*(stateError1 + stateError2);


    stateError1N_2 = stateError1N_1;
    stateError2N_2 = stateError2N_1;
    
    stateError1N_1 = stateError1;
    stateError2N_1 = stateError2;
*/

/*
    uStar = 0.0;

    dX1s = x1s - x1;
    dX2s = x2s - x2;

    var dMin = 100000.0;
    for (let ut=-1.0; ut<1.0; ut+=0.05) {
      dXt = field.stateTransitionFnc(x1, x2, ut);

      let d = (dXt[0]-dX1s)*(dXt[0]-dX1s) + (dXt[1]-dX2s)*(dXt[1]-dX2s);

      if (d<dMin) {
        dMin = d;
        uStar = ut;
      }
    }
*/


    // auto pilot code
    if (autoPilot) {

      // filter control signal
      uStar = filterU*uStar + (1.0 - filterU)*computeBestU(player.position.x, player.position.y, field.stateTransitionFnc, 100, 2*_dt, target.position.x, target.position.y);


      uStar = constrain(uStar, -uMax, uMax);

      // move the joystick
      moveJoystick(uStar);
    }






    if (keyIsDown(UP_ARROW)) {
      moveJoystick(joystick.value + 0.05);
    }
  
    if (keyIsDown(DOWN_ARROW)) {
      moveJoystick(joystick.value - 0.05);
    }




    // move everything
    dynamic.stepPlayer(joystick.value);
    dynamic.randomWalk([target]);
    dynamic.randomWalk(bonuses);
    dynamic.randomWalk(enemies);

    // collision tests
    dynamic.testCollisionWithTarget( (p1, p2) => { 

      targetCollision(p1, p2);

    });

    dynamic.testCollisionWithBonuses( (p1, p2) => { 

      bonusCollision(p1, p2);

    });


    dynamic.testCollisionWithEnemies( (p1, p2) => { 

      enemyCollision(p1, p2);

    });

  }

}
















