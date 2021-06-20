function rand() {
    return -1.0 + 2.0*Math.random();
}

function drawArrow(base, vec, myColor, weight, simple = false) {

    if (!simple) {

        let angle = vec.heading();
        var mag = 0.5 + vec.mag()/100.0;

        if (mag > 1.2)
            mag = 1.2;

        push();

        translate(base.x, base.y);
        rotate(angle);
        image(arrowImage, 0, 0, 70*mag, 40*mag);

        pop();
    } else {

        push();
        stroke(myColor);
        strokeWeight(weight);
        fill(myColor);
        translate(base.x, base.y);
        line(0, 0, vec.x, vec.y);
        rotate(vec.heading());
        let arrowSize = 7;
        translate(vec.mag() - arrowSize, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }
}

  function print(x0, y0, msg, scale = 1.0) {
      let message = msg.toLowerCase()
      var x = x0;
      for (let i = 0; i<message.length; i++) {
          let c = message[i];

          image(fontImgs[c], x, y0, fontImgs[c].width*scale, fontImgs[c].height*scale);
          x += fontImgs[c].width*scale;
      }      
  } 





function loadGameData() {

    state = new State();

    let gameData = JSON.parse( window.localStorage.getItem('CanUControl') );

    if (gameData==null) {
        gameData = {character : 0, state : state };
    }

    state.points = gameData.state.points;
    state.deaths = gameData.state.deaths;
    state.targets = gameData.state.targets;
    state.land = gameData.state.land;
    state.level = gameData.state.level;
    state.frame = gameData.state.frame;
    state.game = gameData.state.game;

    player.name = gameData.character;
    playerImage2 = loadImage('images/res'+(player.name+1)+'.png');

    field.stateTransitionFnc = _dynamics[state.land-1][state.level-1];

    dynamic.field = field;    

}


function saveGameData() {
    let gameData = {character : player.name, state: state};
    window.localStorage.setItem('CanUControl', JSON.stringify(gameData));
}



function randAvoidCenter() {

    let v = createVector(0.0, 0.0);

    while (v.mag()<4.0*PARTICLE_SIZE) {
        v = createVector(rand(), rand());
    }

    return v;
}





function moveJoystick(value) {
    let val = constrain(value, -uMax, uMax);
    $('#sliderJoystick').slider('value', val);
    joystick.value = val;
}





function futurePositions(x, y, U, stateTransitionFnc, N, dt) {

    sig = (x)=>{ return 1.0/Math.exp(-x)}

    let positions = [];

    let NBlocks = U.length;

    U.push(U[NBlocks-1]);

    var p = [x, y];
    for (let i=0; i<N; i++) {

        positions.push([p[0],p[1]]);

        let uIndex = Math.floor(NBlocks*i/N);

        /*
        let saw = ((i - N*uIndex/NBlocks)/(N/NBlocks));
        let sigsaw = sig((saw-0.5)*10);

        let u = U[uIndex]*(1.0-sigsaw) + U[uIndex+1]*sigsaw;
        */

        u = U[uIndex];

        let xp = stateTransitionFnc(p[0], p[1], u);

        p[0] += xp[0]*dt;
        p[1] += xp[1]*dt;

    }


    return positions;
}


function closestDistanceToPositions(targetX, targetY, positions) {

    var dMin = 100000.0;
    for (let i in positions) {
        let p = positions[i];

        let d = ((p[0]-targetX)*(p[0]-targetX) + (p[1]-targetY)*(p[1]-targetY)) + 0.001*i;

        if (d<dMin) {
            dMin = d;
        }
}

return dMin;
}


function computeBestU(x, y, stateTransitionFnc, N, dt, targetX, targetY) {

    uStar = 0.0;

    var minPos;
    var dMin = 100000.0;
    for (let ut1=-uMax; ut1<uMax; ut1 += uMax/10) {
        for (let ut2=-uMax; ut2<uMax; ut2 += uMax/10) {

            let positions = futurePositions(x, y, [ut1, ut2], stateTransitionFnc, N, dt);

            let d = closestDistanceToPositions(targetX, targetY, positions)

            if (d<dMin) {
                dMin = d;
                uStar = ut1;

                minPos = positions;
            }
        }
    }


    drawPositions(minPos);


    return uStar;
}



function drawPositions(positions) {

    for (let i = 0; i < positions.length - 2; i++) {
        let p1 = positions[i];
        let p2 = positions[i+1];

        
        stroke(0,0,0,128);
        strokeWeight(4);
        line((p1[0]+1.0)*SCREEN_SIZE_W/2, (p1[1]+1.0)*SCREEN_SIZE_H/2, 
        (p2[0]+1.0)*SCREEN_SIZE_W/2, (p2[1]+1.0)*SCREEN_SIZE_H/2);
    }

}



function showDialog(message, state, img, callback) {
    console.log('m: '+ message + 'img: '+ img);

    if (img == '') {
        img = _dialogsImages[state.land-1][state.level-1];
    }
    dialog(message, img, false, callback);
}


function showImageDialog(img, callback) {
    
    $( "#dialog-confirm" ).on('click', ()=>{
        $( "#dialog-confirm" ).dialog('close');
    });

    $( "#dialog-confirm" ).html('');

    $( "#dialog-confirm" ).dialog({
        resizable: false,
        width: 512,
        height: 384,
        modal: true,
        close : callback,
        buttons: { }
    });

    let w = $('#dialog-confirm').dialog('widget');
    
    w.css('background-image','url('+img+')');

}


function dialog(message, img, simple, callback) {

    $( function() {
    $( "#dialog-confirm" ).dialog({
        resizable: false,
        width: 512,
        height: 384,
        modal: true,
        close : callback,
        open : () => {

            if (!simple) {

                $('.ui-dialog').css('background-image', 'url(images/bg6.png)');
                $('.ui-dialog').css('background-size', '512px 384px');
                $( "#dialog-img" ).attr('src',img);       
        
                
            } else {
                $( "#dialog-confirm-msg" ).html(message);
                $( ".ui-dialog" ).css('background-image','');
                $( ".ui-dialog" ).css('background-color','#edca82');
            }
        
        },
        buttons: {
            'GO!': function() {
                $( this ).dialog( "close" );
                PAUSE = false;
            }
        }
    });
    } );    

  }



function changeBackground(state) {
    switch (state.land) {
        case 1 : $('#mainCanvas').css('background-image','url(images/bg1_iphone.png)'); break;
        case 2 : $('#mainCanvas').css('background-image','url(images/bg2.png)'); break;
        case 3 : $('#mainCanvas').css('background-image','url(images/bg3.png)'); break;
        case 4 : $('#mainCanvas').css('background-image','url(images/bg4.png)'); break;
    }        
}




  /* script for teaching
  -- Lack os control signal makes it difficult to reach certain states
  -- excess of control signal can easily throw the state out
  -- movement on the space state can be tricky. Depending on the state, you might have to get FAR first to then get closer
  -- 

  */
