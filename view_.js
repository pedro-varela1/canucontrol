class Renderer {
    constructor(canvas, dynamic) {
        this.canvas = canvas;
        this.dynamic = dynamic;
    }


    drawDashboard(state) {
        textSize(60);
        text('T: ' + state.targets + ' P: ' + state.points + ' D: ' + state.deaths, 30, 60);
        text('w: ' + state.land + ' l:' + state.level, 800, 760);
    }


    drawTarget() {
        let target = this.dynamic.target;

        let w = this.canvas.width;
        let h = this.canvas.height;

        stroke(0,0,0);
        fill(255,255,255);
        circle((1.0+target.position.x)*w/2.0, (1.0+target.position.y)*h/2.0, SCREEN_SIZE_H*PARTICLE_SIZE);

        //console.log(w, h, player);
    }


    drawPlayer() {
        let player = this.dynamic.player;

        let w = this.canvas.width;
        let h = this.canvas.height;

        stroke(0,0,0);
        fill(0,0,255);
        circle((1.0+player.position.x)*w/2.0, (1.0+player.position.y)*h/2.0, SCREEN_SIZE_H*PARTICLE_SIZE);

        //console.log(w, h, player);
    }


    drawBonuses() {
        let bonuses = this.dynamic.bonuses;

        let w = this.canvas.width;
        let h = this.canvas.height;

        for (let i = 0; i< bonuses.length; i++) {
            let bonus = bonuses[i];

            stroke(0,0,0);
            fill(0,255,0);
            let x = (1.0+bonus.position.x)*w/2.0;
            let y = (1.0+bonus.position.y)*h/2.0;
            rect(x - SCREEN_SIZE_H*PARTICLE_SIZE/2, y-SCREEN_SIZE_H*PARTICLE_SIZE/2, SCREEN_SIZE_H*PARTICLE_SIZE, SCREEN_SIZE_H*PARTICLE_SIZE);
        }
        //console.log(w, h, player);
    }


    drawEnemies() {
        let enemies = this.dynamic.enemies;

        let w = this.canvas.width;
        let h = this.canvas.height;

        for (let i = 0; i< enemies.length; i++) {
            let enemy = enemies[i];

            stroke(0,0,0);
            fill(255,0,0);
            let x = (1.0+enemy.position.x)*w/2.0;
            let y = (1.0+enemy.position.y)*h/2.0;
            rect(x - SCREEN_SIZE_H*PARTICLE_SIZE/2, y-SCREEN_SIZE_H*PARTICLE_SIZE/2, SCREEN_SIZE_H*PARTICLE_SIZE, SCREEN_SIZE_H*PARTICLE_SIZE);
        }
        //console.log(w, h, player);
    }


    drawField(u) {
        let field = this.dynamic.field;
        
        let w = this.canvas.width;
        let h = this.canvas.height;

        for (let i = 0; i<GRID_SIZE; i++) {
            for (let j = 0; j<GRID_SIZE; j++) {
                let x = -1.0 + 2.0*i/GRID_SIZE;
                let y = -1.0 + 2.0*j/GRID_SIZE;

                let xp = field.computeVector(x, y, u);

                let px = createVector((i+0.5)*w/GRID_SIZE , (j+0.5)*h/GRID_SIZE);
                let vx = createVector(10*xp[0], 10*xp[1]);
                drawArrow( px, vx, 'black', 2, true);

                //console.log(px, vx);
            }
        }
    }

}

function showDialog(message, state, img, callback) {

    dialog(message, '', true, callback);
}

function changeBackground(state) {
    // $('#mainCanvas').css('background-image','url(images/bg1_iphone.png)');   
    $('#mainCanvas').css('background',_landColor[state.land-1]);   
}


$('#pauseButton').attr('src','images/pause_.png');
$('#restartButton').attr('src','images/restart_.png');


//$('#sliderJoystick-bg').css('background-image','url(images/double_arrow.png)');

joystick.element = $('#sliderJoystick');
joystick.element.slider({
    orientation: "vertical",
    min: -1.0,
    max: 1.0,
    step: 0.01,
    value: 0.0,
    slide: function( event, ui ) {
        joystick.value  = ui.value;
    }
});  

$('.ui-slider').css({
    'width':'15px'
});



