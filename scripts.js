/* HTML elements */
const accigBars = [
  document.querySelector("#accig-x .bar"),
  document.querySelector("#accig-y .bar"),
  document.querySelector("#accig-z .bar"),
];

const accBars = [
  document.querySelector("#acc-x .bar"),
  document.querySelector("#acc-y .bar"),
  document.querySelector("#acc-z .bar"),
];

const rotBars = [
  document.querySelector("#rot-alpha .bar"),
  document.querySelector("#rot-beta .bar"),
  document.querySelector("#rot-gamma .bar"),
];
const oriBars = [
  document.querySelector("#ori-alpha .bar"),
  document.querySelector("#ori-beta .bar"),
  document.querySelector("#ori-gamma .bar"),
];

const accigNumbers = [
  document.querySelector("#accig-x .number"),
  document.querySelector("#accig-y .number"),
  document.querySelector("#accig-z .number"),
];

const accNumbers = [
  document.querySelector("#acc-x .number"),
  document.querySelector("#acc-y .number"),
  document.querySelector("#acc-z .number"),
];

const rotNumbers = [
  document.querySelector("#rot-alpha .number"),
  document.querySelector("#rot-beta .number"),
  document.querySelector("#rot-gamma .number"),
];

const oriNumbers = [
  document.querySelector("#ori-alpha .number"),
  document.querySelector("#ori-beta .number"),
  document.querySelector("#ori-gamma .number"),
];

const intervalNumber = document.querySelector("#interval");

/********************************************************************
 * 
 *  start screen (overlay)
 * 
 */
const startScreenDiv = document.getElementById("start-screen");
const startScreenTextDiv = startScreenDiv.querySelector("p");

function setOverlayText(text) {
  startScreenTextDiv.classList.remove("error");
  startScreenTextDiv.innerHTML = text;
}

function setOverlayError(text) {
  startScreenTextDiv.classList.add("error");
  startScreenTextDiv.innerHTML = text;
}

// start
startScreenDiv.style.display = "block";
setOverlayText("touch screen to start");

startScreenDiv.addEventListener("click", () => {
  setOverlayText("checking for motion sensors...");

  requestDeviceMotion()
    .then(() => {
      startScreenDiv.style.display = "none";
    })
    .catch((error) => {
      setOverlayError(error);
    });
});

/********************************************************************
 * 
 *  device motion/orientation
 * 
 */
let dataStreamTimeout = null;
let dataStreamResolve = null;
let scaleAcc = 1; // scale factor to re-invert iOS acceleration

function requestDeviceMotion() {
  return new Promise((resolve, reject) => {
    dataStreamResolve = resolve;

    // set timeout in case that the API response, but no data is sent
    dataStreamTimeout = setTimeout(() => {
      dataStreamTimeout = null;
      reject("no device motion/orientation data streams");
    }, 1000);

    if (DeviceMotionEvent || DeviceOrientationEvent) {
      if (DeviceMotionEvent.requestPermission || DeviceOrientationEvent.requestPermission) {
        // ask device motion/orientation permission on iOS
        DeviceMotionEvent.requestPermission()
          .then((response) => {
            if (response == "granted") {
              // got permission
              window.addEventListener("devicemotion", onDeviceMotion);
              resolve();

              // re-invert inverted iOS acceleration values
              scaleAcc = -1; // ???
            } else {
              reject("no permission for device motion");
            }
          })
          .catch(console.error);

        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response == "granted") {
              window.addEventListener("deviceorientation", onDeviceOrientation);
              resolve();
            } else {
              reject("no permission for device orientation");
            }
          })
          .catch(console.error);
      } else {
        // no permission needed on non-iOS devices
        window.addEventListener("devicemotion", onDeviceMotion);
        window.addEventListener("deviceorientation", onDeviceOrientation);
      }
    } else {
      reject("device motion/orientation not available");
    }
  });
}

function onDeviceMotion(e) {
  if (dataStreamTimeout !== null && dataStreamResolve !== null) {
    dataStreamResolve();
    clearTimeout(dataStreamTimeout);
  }

  const accig = e.accelerationIncludingGravity;
  setBiBar(accigBars[0], accig.x / 20);
  setBiBar(accigBars[1], accig.y / 20);
  setBiBar(accigBars[2], accig.z / 20);
  setNumber(accigNumbers[0], accig.x);
  setNumber(accigNumbers[1], accig.y);
  setNumber(accigNumbers[2], accig.z);
  setNumber(intervalNumber, accig.interval, 6);

  const acc = e.acceleration;
  setBiBar(accBars[0], acc.x / 20);
  setBiBar(accBars[1], acc.y / 20);
  setBiBar(accBars[2], acc.z / 20);
  setNumber(accNumbers[0], acc.x);
  setNumber(accNumbers[1], acc.y);
  setNumber(accNumbers[2], acc.z);

  const rot = e.rotationRate;
  setBiBar(rotBars[0], rot.alpha / 360);
  setBiBar(rotBars[1], rot.beta / 360);
  setBiBar(rotBars[2], rot.gamma / 360);
  setNumber(rotNumbers[0], rot.alpha);
  setNumber(rotNumbers[1], rot.beta);
  setNumber(rotNumbers[2], rot.gamma);
}

function onDeviceOrientation(e) {
  if (dataStreamTimeout !== null && dataStreamResolve !== null) {
    dataStreamResolve();
    clearTimeout(dataStreamTimeout);
  }

  setBar(oriBars[0], e.alpha / 360);
  setBiBar(oriBars[1], e.beta / 180);
  setBiBar(oriBars[2], e.gamma / 90);
  setNumber(oriNumbers[0], e.alpha);
  setNumber(oriNumbers[1], e.beta);
  setNumber(oriNumbers[2], e.gamma);
}

/********************************************************
 *
 *  display functions
 *
 */
function setBar(bar, value) {
  if (value >= 0) {
    bar.style.left = "0";
    bar.style.width = `${100 * value}%`;
  }
}

function setNumber(div, value, numDec = 2) {
  div.innerHTML = value.toFixed(numDec);
}

function setBiBar(div, value) {
  if (value >= 0) {
    div.style.left = "50%";
    div.style.width = `${50 * value}%`;
  }
  else {
    div.style.left = `${50 * (1 + value)}%`;
    div.style.width = `${50 * -value}%`;
  }
}
