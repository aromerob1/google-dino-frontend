let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;

let dinoImg;

let dino = {
  x: dinoX,
  y: dinoY,
  width: dinoWidth,
  height: dinoHeight,
};

let allCactus = [];
let smallCactus1W = 34;
let smallCactus2W = 69;
let smallCactus3W = 102;

let smallCactusH = 70;
let smallCactusX = 700;
let smallCactusY = boardHeight - smallCactusH;
let smallCactus1Img;
let smallCactus2Img;
let smallCactus3Img;

let velocityX = -8;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = () => {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;

  const table = document.getElementById('table');
  table.style.width = boardWidth + 'px';

  context = board.getContext("2d");

  dinoImg = new Image();
  dinoImg.src = "./img/dino.png";
  dinoImg.onload = function () {
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
  };
  smallCactus1Img = new Image();
  smallCactus2Img = new Image();
  smallCactus3Img = new Image();
  smallCactus1Img.src = "./img/cactus1.png";
  smallCactus2Img.src = "./img/cactus2.png";
  smallCactus3Img.src = "./img/cactus3.png";

  requestAnimationFrame(update);
  setInterval(placeCactus, 1000);
  document.addEventListener("keydown", moveDino);
  getScoresAndUpdateTable();
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return endGame();
  }

  context.clearRect(0, 0, board.width, board.height);

  velocityY += gravity;
  dino.y = Math.min(dino.y + velocityY, dinoY);

  context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

  for (let i = 0; i < allCactus.length; i++) {
    let cactus = allCactus[i];
    cactus.x += velocityX;
    context.drawImage(
      cactus.img,
      cactus.x,
      cactus.y,
      cactus.width,
      cactus.height
    );

    if (detectCollision(dino, cactus)) {
      gameOver = true;
      dinoImg.src = "./img/dino-dead.png";
      dino.onload = function () {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
      };
    }
  }

  context.fillStyle = "black";
  context.font = "20px courier";
  score++;
  context.fillText(score, 5, 20);
}

function moveDino(e) {
  if (gameOver) {
    return;
  }

  if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
    velocityY = -10;
  } else if (e.code == "ArrowDown" && dino.y == dinoY) {
    //agacharse
  }
}

function placeCactus() {
  if (gameOver) {
    return;
  }
  let cactus = {
    img: null,
    x: smallCactusX,
    y: smallCactusY,
    width: null,
    height: null,
  };

  let placeCactusChance = Math.random();

  if (placeCactusChance > 0.9) {
    cactus.img = smallCactus3Img;
    cactus.width = smallCactus3W;
    cactus.height = smallCactusH;

    allCactus.push(cactus);
  } else if (placeCactusChance > 0.7) {
    cactus.img = smallCactus2Img;
    cactus.width = smallCactus2W;
    cactus.height = smallCactusH;

    allCactus.push(cactus);
  } else if (placeCactusChance > 0.5) {
    cactus.img = smallCactus1Img;
    cactus.width = smallCactus1W;
    cactus.height = smallCactusH;

    allCactus.push(cactus);
  }

  if (allCactus.length > 5) {
    allCactus.shift();
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endGame() {
  context.fillStyle = "black";
  context.font = "30px Arial";
  context.fillText("Game Over!", boardWidth / 2 - 70, boardHeight / 2 - 40);
  context.fillText(
    "Score: " + score,
    boardWidth / 2 - 70,
    boardHeight / 2 + 40 - 40
  );
  document.getElementById("gameOverContainer").style.display = "block";
}

function submitScore() {
  var username = document.getElementById("usernameInput").value;
  var scoreData = { username: username, value: score };
console.log(score)
  fetch("https://google-dino-backend-1f0a22d5842a.herokuapp.com/ranking/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scoreData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      restartGame(); 
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function restartGame() {
  location.reload();
}

function getScoresAndUpdateTable() {
  fetch("https://google-dino-backend-1f0a22d5842a.herokuapp.com/ranking/top5") 
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      updateScoresTable(data);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function updateScoresTable(scores) {
  const tableBody = document.getElementById('scoresTableBody'); 
  const table = document.getElementById('table');
  table.style.width = boardWidth + 'px';
  tableBody.innerHTML = ''; 

  scores.forEach((score, index) => {
    console.log(score)
    const row = tableBody.insertRow();
    const cellRank = row.insertCell(0);
    const cellScore = row.insertCell(1);
    const cellName = row.insertCell(2);

    cellRank.textContent = index + 1;
    cellScore.textContent = score.value;
    cellName.textContent = score.username;
  });
}
