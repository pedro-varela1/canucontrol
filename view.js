class Renderer {
    constructor(canvas, dynamic) {
        this.canvas = canvas;
        this.dynamic = dynamic;
    }


    drawDashboard(state) {
        print(10, 10, 'targets: ' + state.targets + ' points: ' + state.points + ' deaths: ' + state.deaths, 0.3);
        print(700, 700, 'world: ' + state.land + ' land:' + state.level, 0.3);
    }


    drawTarget() {
        let target = this.dynamic.target;

        let w = this.canvas.width;
        let h = this.canvas.height;

        let x = (1.0+target.position.x)*w/2.0;
        let y = (1.0+target.position.y)*h/2.0;

        stroke(0,0,0);
        fill(255,255,255);
        
        image(targetImage, x-targetImage.width/2, y - targetImage.height/2);
    }


    drawPlayer() {
        let player = this.dynamic.player;

        let w = this.canvas.width;
        let h = this.canvas.height;

        let x = (1.0+player.position.x)*w/2.0;
        let y = (1.0+player.position.y)*h/2.0;

        stroke(0,0,0);
        fill(0,0,255);

        let he = playerImage2.height*(1.0 + 0.1*Math.sin(state.frame/3.0));
        image(playerImage2, x - playerImage2.width/2, y - he, playerImage2.width, he);
        image(playerImage1, x-playerImage1.width/2, y - playerImage1.height/2);

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
            image(bonusImage, x-bonusImage.width/2, y - bonusImage.height/2)
        }
    }


    drawEnemies() {
        let enemies = this.dynamic.enemies;

        let w = this.canvas.width;
        let h = this.canvas.height;

        for (let i = 0; i< enemies.length; i++) {
            let enemy = enemies[i];

            stroke(0,0,0);
            fill(255,0,0);
            let x = (1.0 + enemy.position.x)*w/2.0;
            let y = (1.0 + enemy.position.y)*h/2.0;
            image(enemyImage, x-enemyImage.width/2, y - enemyImage.height/2)
        }
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
                drawArrow( px, vx, 'black', 2);

                //console.log(px, vx);
            }
        }
    }

}




// $('#pauseButton').attr('src','images/pause.png');
// $('#restartButton').attr('src','images/restart.png');


//$('#sliderJoystick-bg').css('background-image','url(images/double_arrow.png)');

// $('.ui-slider').css({
//     'background':'transparent',
//     'background-clip':'unset',
//     'border':'none'
// });


// $('.ui-slider .ui-slider-handle').css({
//     'display': 'block',
//     'margin-top': '-80px',
//     'position': 'absolute',
//     'left': '5px',
//     'width': '115px',
//     'height': '160px',
//     'background': 'transparent',
//     'background-image': 'url(images/joystick_thumb.png)',
//     'background-size': '115px 160px',
//     'border': 'none',
// });


