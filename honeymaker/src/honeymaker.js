let cnv, ctx, scoreText;
let game, start, end;
let loop, score;

let imgBee, imgHoney, imgFlowers;

const CNV_WIDTH = CNV_HEIGHT = 400; 
const BOARD_SIZE = 16, COLORS = 3;
const BCK_COL = "#000", TILE_COL = "#00FFAA";
const FPS = 1000 / 5;

let player, flower;

onload = function() {
    cnv = document.getElementById('canvas');
    scoreText = document.getElementById('score');
    ctx = cnv.getContext('2d');

    game = document.getElementById('game');
    start = document.getElementById('start');
    end = document.getElementById('end');

    imgBee = new Image();
    imgHoney = new Image();
    imgFlowers = new Image();
    imgBee.src = "img/beh.webp";
    imgHoney.src = "img/honey.webp";
    imgFlowers.src = "img/flowers.png";

    addEventListener("keydown", keyPressed);
}

function startGame() {
    game.style.display = 'block';
    start.style.display = 'none';
    end.style.display = 'none';
    init();
}

function endGame() {
    document.getElementById('final-score').innerHTML = score;
    game.style.display = 'none';
    end.style.display = 'block';
    clearInterval(loop);
}

function init () {
    cnv.width = CNV_WIDTH;
    cnv.height = CNV_HEIGHT;

    score = -1;
    updateScore();

    drawRect(0, 0, cnv.width, cnv.height, BCK_COL);

    player = {
        x: BOARD_SIZE / 2,
        y: BOARD_SIZE / 2,
        xv: 1,
        yv: 0,
        body: [
            {x: BOARD_SIZE / 2, y: BOARD_SIZE / 2},
        ]
    }

    flower = {
        x: BOARD_SIZE  - 2,
        y: BOARD_SIZE / 2,
        color: 0,
    }

    loop = setInterval(() => {
        update();
    }, FPS);
}

function update() {
    movePlayer();
    renderBoard();
}

function keyPressed(event) {
    switch(event.keyCode) {
        case 87:
        case 38: { //W, UpArrow
            player.yv = -1;
            player.xv = 0;
            return;
        }
        case 65:
        case 37: { //A, LeftArrow
            player.yv = 0;
            player.xv = -1;
            return;
        }
        case 83:
        case 40: { //S, DownArrow
            player.yv = 1;
            player.xv = 0;
            return;
        }
        case 68: 
        case 39: { //D, RightArrow
            player.yv = 0;
            player.xv = 1;
            return;
        }
    }
}

function movePlayer() {
    player.x += player.xv;
    player.y += player.yv;

    //Hit the wall
    if(player.x < 0 || player.x >= BOARD_SIZE || player.y < 0 || player.y >= BOARD_SIZE) {
        endGame();
        console.log("Game over - hit a wall");
        return;
    }

    //Hit itself
    for(part of player.body) {
        if(player.x === part.x && player.y === part.y) {
            endGame();
            console.log("Game over - hit yourself");
            return;
        }
    }

    //Hit flower
    if(player.x === flower.x && player.y == flower.y) {
        console.log("Polinated!");
        player.body.push({x: player.x, y: player.y});
        updateScore();
        plantNewFlower();
        return;
    }

    //Move player -> add one piece where the head is, remove one at the and, HACKS!
    player.body.push({x: player.x, y: player.y});
    player.body.shift();
}

function plantNewFlower() {
    let newX, newY;
    let legit = false;

    while(!legit) {
        newX = Math.floor(Math.random() * BOARD_SIZE);
        newY = Math.floor(Math.random() * BOARD_SIZE);

        legit = true;
        for(part of player.body) {
            if(part.x === newX && part.y === newY) {
                console.log("Bad flower at:" + part.x + ", " + part.y + ". Trying again!");
                legit = false;
            }
        }
    }
    flower.color = Math.floor(Math.random() * COLORS);
    flower.x = newX;
    flower.y = newY;
}

// -- RENDERING --
function updateScore() {
    score++;
    scoreText.innerHTML = "" + score;
}

function drawFlower(x, y, width, height, type = 3) {
    if(type == 0) { //RED FLOWER
        ctx.drawImage(imgFlowers, 0, 0, 10, 10, x, y, width, height);
    } else if(type == 1) { //BLUE
        ctx.drawImage(imgFlowers, 10, 0, 10, 10, x, y, width, height);
    } else if(type == 2) { //PURPLE
        ctx.drawImage(imgFlowers, 0, 10, 10, 10, x, y, width, height);
    } else { //MEADOW
        ctx.drawImage(imgFlowers, 10, 10, 10, 10, x, y, width, height);
    }
}

function renderBoard() {
    let tileW = cnv.width / BOARD_SIZE;
    let tileH = cnv.height / BOARD_SIZE;

    //Draw board
    for(let i = 0; i < BOARD_SIZE; i++) {
        for(let j = 0; j < BOARD_SIZE; j++) {
            drawFlower(i * tileW, j * tileH, tileW, tileH);
        }
    }

    //Draw player --> head is a bee, rest will be honeypots
    for(let i = 0; i < player.body.length - 1; i++) {
        part = player.body[i];
        ctx.drawImage(imgHoney, part.x * tileW, part.y * tileH, tileW, tileH);
    }
    part = player.body[player.body.length - 1];
    ctx.drawImage(imgBee, part.x * tileW, part.y * tileH, tileW, tileH);

    //Draw flower
    drawFlower(flower.x * tileW, flower.y * tileH, tileW, tileH, flower.color);
}

// -- DRAW LOGIC --
function drawPaddedRect(x, y, width, height, color) {
    let PADDING = 2;
    drawRect(x + PADDING, y + PADDING, width - 2 * PADDING, height - 2 * PADDING, color)
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