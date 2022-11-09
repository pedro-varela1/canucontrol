let SCREEN_SIZE_W = 1200;
let SCREEN_SIZE_H = 800;

let GRID_SIZE = 15;

let PARTICLE_SIZE = 0.06;

var PAUSE = true;

var state = undefined;

let _dt = 0.01;

let filterU = 0.95;
var uStar = 0.0;

let _bonusPoints = 10;
let _levelPoints = 30;

let uMax = 1.0;

var autoPilot = false;


let comm = undefined;

let gamepad = undefined;
var useGamepad = true;



var gameData = null;




let joystick = {
    element : undefined,
    x : 0.9,
    y : 0.1,
    size : 0.8,
    value :0.0
};

var CANVAS;

var sounds = {
    bgMusic : undefined,
    beepSound : undefined,
    bonusSound : undefined,
    deathSound : undefined,
    targetSound : undefined,
}


var bonuses = [];
var enemies = [];
var target;
var player;
var field;
var dynamic;


var enemyImage = undefined;
var targetImage = undefined;
var bonusImage = undefined;
var playerImage1 = undefined;
var playerImage2 = undefined;

var arrowImage = undefined;

var bgImage = undefined;

var fontImgs = {'a':undefined, 
'b':undefined, 
'c':undefined, 
'd':undefined, 
'e':undefined, 
'f':undefined, 
'g':undefined, 
'h':undefined, 
'i':undefined, 
'j':undefined, 
'k':undefined, 
'l':undefined, 
'm':undefined, 
'n':undefined, 
'o':undefined, 
'p':undefined, 
'q':undefined, 
'r':undefined, 
's':undefined, 
't':undefined, 
'u':undefined, 
'v':undefined, 
'w':undefined, 
'x':undefined, 
'y':undefined, 
'z':undefined, 
'@':undefined, 
'0':undefined, 
'1':undefined, 
'2':undefined, 
'3':undefined, 
'4':undefined, 
'5':undefined, 
'6':undefined, 
'7':undefined, 
'8':undefined, 
'9':undefined, 
'0':undefined, 
'+':undefined, 
'-':undefined, 
'(':undefined, 
')':undefined, 
'%':'percent', 
'!':undefined, 
'?':'question', 
' ':'space', 
'#':'number', 

'/':'slash', 
':':'colon', 
',':'comma', 
'.':'dot', 
}


_landCompleteImages = ['images/linearland_complete.png', 'images/nonlinearland_complete.png', 'images/switchingland_complete.png', 'images/quantized_complete.png'];

_dialogsImages = [
    ['images/signPost_stage1.png',
    'images/signPost_stage2.png',
    'images/signPost_stage3.png',
    'images/signPost_stage4.png'],

    ['images/signPost_stage5.png',
    'images/signPost_stage6.png',
    'images/signPost_stage7.png',
    'images/signPost_stage8.png',
    'images/signPost_stage9.png'],

    ['images/signPost_stage10.png',
    'images/signPost_stage11.png',
    'images/signPost_stage12.png',
    'images/signPost_stage13.png'],

    ['images/signPost_stage14.png',
    'images/signPost_stage15.png',
    'images/signPost_stage16.png',
    'images/signPost_stage17.png'],
]

_landColor = ['lightblue', 'lightgreen', 'lightred','gray'];

_dynamics = [

    // Linearland

    [
    (x,y,u) => {

        return [-5.2*x + 2.5*y + 3.2*u, -9*x - 0.8*y + 5.0*u];
    },


    (x,y,u) => {
        return [5.0*y, -0.9*y -9.0*x + 5*u];
    },


    (x,y,u) => {
        return [2.0*y - 1.2*x, -0.4*y + 3.6*x - 5*u];
    },


    (x,y,u) => {
        return [1.0*x - 0.4*y + 0.6*u, 1.8*x + 0.2*y - 5.0*u];
    },
],







// non-linearland

[
    (x,y,u) => {
        return [3*y + u, -3*sin(8*x) - y];
    },


    (x,y,u) => {
        let f = Math.atan(4*x);
        return [2*y - 2*x + f + 2*u, 2*x - 2*y];
    },


    (x,y,u) => {
        return [3*x*(0.5*x + 1.5*y) + 2.0*u, 3*(x-y) + u*u];
    },


    (x,y,u) => {
        return [-(x-0.7)*(x+0.7)/0.1 + 5.0*u, -y + 2*u];
    },
],





// switching land
[
    (x,y,u) => {
        x = x*10.0;
        y = y*10.0;
        u = u*5.0;

        let A00 = 0;
        let A01 = 1;
        let A10 = -0.5;
        let A11 = -0.5;
        let B0 = 0.5;
        let B1 = 0.8;
        var xp = 0;
        var yp = 0;
        if (x>y) {
            xp = A00*x + A01*y + B0*u + 3.0;
            yp = A10*x + A11*y + B1*u;    
        } else {
            xp = A00*x + A01*y + B0*u - 3.0;
            yp = A10*x + A11*y + B1*u;    
        }

        return [xp/3, yp/3];
    },


    (x,y,u) => {


        let A00 = 0.0;
        let A01 = -1.0;
        let A10 = -0.25;
        let A11 = 0.0;
    
        var xp = 0.0;
        var yp = 0.0;

        if (x>0) {
            xp = A00*x + A01*y;
            yp = A10*x + A11*y + 2*u;
        } else {
            xp = A00*x + A01*y;
            yp = A10*x + A11*y - 2*u;
        }
    
        return [xp, yp];
    },


    (x,y,u) => {

        x = x*10.0;
        y = y*10.0;
        u = u*5.0;
        
        A00 = 0.0;
        A01 = -1.0;
        A10 = 1.0;
        A11 = 0.0;
        
        if (x<y) {
            xp = A00*x + A01*y;
            yp = A10*x + A11*y + 4.0 + u;
        } else {
            xp = A00*x + A01*y;
            yp = A10*x + A11*y - 4.0 - u;
        }


        return [xp/4, yp/4];
    },


    (x,y,u) => {
        
        x = x*10.0;
        y = y*10.0;
        u = u*5.0;

        let A00 = 0.7578;
        let A01 = -1.9796;
        let A10 = 1.7454;
        let A11 = -0.3350;
        let B0 = 0.1005;
        let B1 = -2.1600;
        let V0 = -0.1582;
        let V1 = 1.8467;
        let a = 1.2759;
        
        if ( (V0*x + V1*y)>0 ) {
            xp = A00*x + A01*y + a*B0*u;
            yp = A10*x + A11*y + a*B1*u;
        } else {
            xp = A00*x + A01*y - a*B0*u;
            yp = A10*x + A11*y - a*B1*u;
        }

        return [xp/6, yp/6];
    },
],






// quantized land

[
    (x,y,u) => {
        
        x = x*10.0;
        y = y*10.0;
        u = u*5.0;

        let A00 = 0;
        let A01 = 1;
        let A10 = -0.5;
        let A11 = -0.5;
        let B0 = 0.5;
        let B1 = 0.8;
        
        var xp = A00*x + A01*y + B0*u;
        var yp = A10*x + A11*y + B1*u;
        
        xp = (xp>0)?4.0:-4.0;
        yp = (yp>0)?4.0:-4.0;
        
        return [xp/5, yp/5];
    },


    (x,y,u) => {

        x = x*10.0;
        y = y*10.0;
        u = u*5.0;

        A00 = 0.0;
        A01 = -1.0;
        A10 = 1.0;
        A11 = 0.0;
        B0 = 0.0;
        B1 = 1.0;
        
        xp = A00*x + A01*y + B0*u;
        yp = A10*x + A11*y + B1*u;
        
        if ( (xp>0.0)&&(xp<2.0) )
            xp = 2.0;
        if ( (xp<0.0)&&(xp>-2.0) )
            xp = -2.0;
        if (xp>2.0)
            xp = 4.0;
        if (xp<-2.0)
            xp = -4.0;
    
        if ( (yp>0.0)&&(yp<2.0) )
            yp = 2.0;
        if ( (yp<0.0)&&(yp>-2.0) )
            yp = -2.0;
        if (yp>2.0)
            yp = 4.0;
        if (yp<-2.0)
            yp = -4.0;

            
        return [xp/5, yp/5];
    },


    (x,y,u) => {

        x = x*10.0;
        y = y*10.0;
        u = u*5.0;


        let A00 = 0.0;
        let A01 = 1.0;
        let A10 = 1.0;
        let A11 = 0.0;
        let B0 = 0.0;
        let B1 = 2.0;
        
        xp = A00*x + A01*y + B0*u;
        yp = A10*x + A11*y + B1*u;
        
        if ( (xp>0.0)&&(xp<2.0) )
            xp = 2.0;
        if ( (xp<0.0)&&(xp>-2.0) )
            xp = -2.0;
        if (xp>2.0)
            xp = 4.0;
        if (xp<-2.0)
            xp = -4.0;
        
        if ( (yp>0.0)&&(yp<2.0) )
            yp = 2.0;
        if ( (yp<0.0)&&(yp>-2.0) )
            yp = -2.0;
        if (yp>2.0)
            yp = 4.0;
        if (yp<-2.0)
            yp = -4.0;




        return [xp/5, yp/5];
    },


    (x,y,u) => {
        x = x*10.0;
        y = y*10.0;
        u = u*5.0;


        xp = y + u;
        yp = -(9.8/1.0)*sin(x) - 1.0*y;
        
        
        xp = (xp>0)?2.0:-2.0;
        yp = (yp>0)?2.0:-2.0;


        return [xp/5, yp/5];
    },
],




];