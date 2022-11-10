const section = document.querySelector("#section");
const logo = document.querySelector("#roamer");
var animFlag;
section.style.display = "none";
logo.style.display = "none";

function roam() {
  const FPS = 60;
  logo.removeEventListener('click', unroam);
  section.style.display = "block";
  logo.style.display = "block";
  section.style.height = window.innerHeight + "px";
  section.style.width = window.innerWidth + "px";

  // Logo moving velocity Variables
  let xPosition = 10;
  let yPosition = 10;
  let xSpeed = 4;
  let ySpeed = 4;
  function update() {
    logo.style.left = xPosition + "px";
    logo.style.top = yPosition + "px";
  }

  window.clearInterval(animFlag);
  animFlag = setInterval(() => {
    if (xPosition + logo.clientWidth >= window.innerWidth || xPosition <= 0) {
      xSpeed = -xSpeed;
    }
    if (yPosition + logo.clientHeight >= window.innerHeight || yPosition <= 0) {
      ySpeed = -ySpeed;
    }

    xPosition += xSpeed;
    yPosition += ySpeed;
    update();
  }, 1000 / FPS);

  window.addEventListener("resize", () => {
    xPosition = 10;
    yPosition = 10;

    section.style.height = window.innerHeight + "px";
    section.style.width = window.innerWidth + "px";
  });
  let now = new Date();
  let date = new Date(spam.time*1000);
  let diff = dateDiff(now,date);

  window.setTimeout(() => {
    logo.style.background = "green";
    logo.addEventListener('click', unroam);
  }, diff.sec*1000);
}

function unroam() {
  section.style.display = "none";
  logo.style.display = "none";
  logo.style.background = "red";
  logo.removeEventListener('click', unroam);
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/sendspam", true);
  xhr.send();
}