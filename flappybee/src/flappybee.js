let loop, cnv, ctx, strt, gover, gwin;
let bee;
let pipes, pipe;
let frameCount, pipesCount;

let beeImg, stalkTopImg, stalkBottomImg, thornImg, winbeeImg;

let MB_SEED = 123456;
let BCK_COLOR = "#aaf"
let WIN_COND = 20;
let rand;

let score;

window.onload = function() {
    cnv = document.getElementById('canvas');
    strt = document.getElementById('start');
    gover = document.getElementById('game-over');
    gwin = document.getElementById('game-win');
    ctx = cnv.getContext('2d');

    addEventListener("keydown", keyPressed);
    addEventListener("click", clicked);

    init();
    
    console.log('loaded');
}

function startGame() {
    cnv.style.display = 'block';
    strt.style.display = 'none';
    gover.style.display = 'none';
    gwin.style.display = 'none';
    
    reset();
    
    loop = setInterval(() => {
        update();
        render();
    }, 1000/60);
}

function gameOver() {
    document.getElementById('score-text').innerHTML = "You dodged " + score + " stalks.";

    cnv.style.display = 'none';
    strt.style.display = 'none';
    gover.style.display = 'block';
    gwin.style.display = 'none';

    clearInterval(loop);
}

function gameWin() {
    cnv.style.display = 'none';
    strt.style.display = 'none';
    gover.style.display = 'none';
    gwin.style.display = 'block';

    clearInterval(loop);
}

function init() {
    rand = mulberry32(MB_SEED); //Setting up PRNG
    frameCount = 0;
    pipesCount = 0;

    pipes = [];

    beeImg = new Image();
    stalkTopImg = new Image();
    stalkBottomImg = new Image();
    beeImg.src = 'img/bee.png';
    stalkTopImg.src = 'img/stalk_top.png';
    stalkBottomImg.src = 'img/stalk_bottom.png';

    score = 0;

    bee = {
        x: 75,
        y: 50,
        yv: 0,
        size: 16,
        color:"#ff0",
        gravity: 0.1,
        lift: -8,
    }

    pipe = {
        top: 0,
        bottom: 0,
        x: 0,
        width: 60,
        speed: 4,
        color:"#0f0",
        scored: false,
    }
}

function reset() {
    rand = mulberry32(MB_SEED);
    pipes = [];

    score = 0;
    pipesCount = 0;
    
    bee.x = 75;
    bee.y = 50;
    bee.yv = 0;
}

function update() {
    updateBee();
    updatePipes();
}

function render() {
    drawRect(0, 0, cnv.width, cnv.height, BCK_COLOR);
    renderBee()
    drawPipes();

    printText(score, cnv.width / 2, cnv.height - 50, "50px", "Arial", "#000");
}

function renderBee() {
    //drawCircle(bee.x, bee.y, bee.size, bee.color); //TODO: For some reason when first pipe appears it changes color to the same color as the pipes
    ctx.drawImage(beeImg, bee.x - bee.size, bee.y - bee.size);
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.fill();
}

function drawCircle(x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawPipes() {
    pipes.forEach(p => {
        drawRect(p.x, 0, p.width, p.top, p.color);
        drawRect(p.x, cnv.height - p.bottom, p.width, p.bottom, p.color);
        ctx.drawImage(stalkTopImg, p.x - 2, cnv.height - p.bottom);
        ctx.drawImage(stalkBottomImg, p.x - 2, p.top - 16);
    });
}

function resetPipes(pipe) {
    let lowerLimit = cnv.height / 3;

    pipe.top = Math.floor((rand() * 100) + lowerLimit);
    pipe.bottom = Math.floor((rand() * 100) + lowerLimit);
    
    console.log(pipe.top + " // " + pipe.bottom);

    pipe.x = cnv.width;
}

function updatePipes() {
    frameCount++;
    
    if(frameCount % 60 == 0 && pipesCount < WIN_COND) {
        console.log(pipesCount);
        frameCount = 0;
        
        console.log("Adding pipe.");
        
        let p = {...pipe};
        resetPipes(p);
        pipes.push(p);
        
        pipesCount++;
    }


    for(let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= p.speed;
        checkForCollisions(bee, p);
        if(p.x < -p.width) { //Pipe is out of screen, remove from array
            pipes.splice(i, 1);
        }
    }
}

function updateBee() {
    bee.yv += bee.gravity;
    bee.y += bee.yv;

    if (bee.yv < bee.lift) {
        bee.yv = bee.lift;
    }
    if(bee.y >= cnv.height - bee.size) {
        bee.yv = 0;
        bee.y = cnv.height - bee.size;
    }
    if(bee.y <= bee.size) {
        bee.yv = 0;
        bee.y = bee.size;
    }
}

function liftBee() {
    bee.yv += bee.lift;
}

function keyPressed(event) {
    if(event.keyCode == 32) { // 32 -> spacebar
        liftBee();
    }
}

function clicked(event) {
    liftBee();
}

function checkForCollisions(bee, pipe) {
    if(bee.y < pipe.top || bee.y > cnv.height - pipe.bottom) { //Did I hit the pipe height-wise?
        if(bee.x + bee.size > pipe.x && bee.x - bee.size < pipe.x + pipe.width) { //If yes, am I in the width of the pipe?
            pipe.color = "#f00";
            gameOver();
            return;
        }
    }

    if(bee.x + bee.size > pipe.x && bee.x - bee.size < pipe.x + pipe.width && !pipe.scored) {
        score++;
        pipe.scored = true;

        if(score >= WIN_COND) {
            setTimeout(gameWin, 1000);
        }
    }
}

function printText(text, x, y, size, font, color) {
    ctx.fillStyle = color;
    ctx.font = `${size} ${font}`;
    ctx.fillText(text, x, y);
}

//Pseudo RNG, credits to: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}