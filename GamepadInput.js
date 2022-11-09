
//https://luser.github.io/gamepadtest/

class GamepadInput {
  constructor() {

    this.haveEvents = 'GamepadEvent' in window;
    this.haveWebkitEvents = 'WebKitGamepadEvent' in window;

    this.controllers = [];

  }

  init() {

    if (this.haveEvents) {
      window.addEventListener("gamepadconnected", (e)=>{
        //this.connecthandler
        this.connecthandler(e);        
        console.log(e);
      });
      window.addEventListener("gamepaddisconnected", (e)=>{
        this.disconnecthandler(e);
        console.log(e);
      });
    } else if (this.haveWebkitEvents) {
      window.addEventListener("webkitgamepadconnected", this.connecthandler, (e)=>{
        this.disconnecthandler(e);
        console.log(e);
      });
      window.addEventListener("webkitgamepaddisconnected", this.disconnecthandler, (e)=>{
        this.disconnecthandler(e);
        console.log(e);
      });
    }

  }

  connecthandler(e) {
    this.addgamepad(e.gamepad);
  }

  addgamepad(gamepad) {
    console.log('Connected: ' + gamepad);

    this.controllers.push(gamepad);
  }

  disconnecthandler(e) {
    this.removegamepad(e.gamepad);
  }

  removegamepad(gamepad) {
    console.log('disconected: ' + gamepad);

    delete this.controllers[gamepad.index];
  }

  scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && (gamepads[i].index in this.controllers)) {
        this.controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }


}

/*

let controller = new GamepadInput();

controller.init();


setInterval( ()=>{
  controller.scangamepads();

  let x1 = Math.round(controller.controllers[0].axes[0]*100)/100;
  let x2 = Math.round(controller.controllers[0].axes[2]*100)/100;
  let y1 = Math.round(controller.controllers[0].axes[1]*100)/100;
  let y2 = Math.round(controller.controllers[0].axes[3]*100)/100;

  let start = document.getElementById('start');
  start.innerHTML = '<pre>x1: ' + x1 + '\n' + 'y1: ' + y1 + '\n' + 'x2: ' + x2 + '\n' + 'y2: ' + y2;
}, 50);
*/