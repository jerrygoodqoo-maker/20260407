let pointsTop = [];
let pointsBottom = [];
let gameState = "WAIT"; // WAIT, PLAYING, WIN, LOSE
let startBtn;
let numPoints = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  generatePath();
  
  // 建立開始按鈕，位置放在右邊
  startBtn = createButton('開始遊戲');
  positionButton();
  startBtn.mousePressed(startGame);
}

function draw() {
  background(30);

  if (gameState === "WAIT") {
    drawPath();
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("請按下按鈕開始遊戲", width / 2, height / 2 - 60);
  } 
  else if (gameState === "PLAYING") {
    drawPlayer(); // 繪製自訂滑鼠圖示
    drawPath();
    checkCollision();
    checkWin();
    
    // 顯示遊戲中提示
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("移動到綠色區域", width / 2, 50);

    // 繪製起點區域 (黃色)
    fill(255, 255, 0, 100); 
    noStroke();
    // 考慮到線條寬度為 3，我們從 y + 1.5 開始畫，高度減 3，確保不超出線外
    let startY = pointsTop[0].y + 1.5;
    let startH = (pointsBottom[0].y - 1.5) - startY;
    rect(0, startY, 40, startH);

    // 繪製終點區域 (綠色)
    fill(0, 255, 0, 100);
    let last = numPoints - 1;
    let endY = pointsTop[last].y + 1.5;
    let endH = (pointsBottom[last].y - 1.5) - endY;
    rect(width - 40, endY, 40, endH);
  } 
  else if (gameState === "WIN") {
    cursor(ARROW);
    fill(0, 255, 0);
    textAlign(CENTER);
    textSize(64);
    text("遊戲成功！", width / 2, height / 2);
    textSize(24);
    text("點擊畫面重新開始", width / 2, height / 2 + 60);
  } 
  else if (gameState === "LOSE") {
    cursor(ARROW);
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(64);
    text("遊戲失敗！", width / 2, height / 2);
    textSize(24);
    text("點擊畫面重新重試", width / 2, height / 2 + 60);
  }
}

function generatePath() {
  pointsTop = [];
  pointsBottom = [];
  let spacing = width / (numPoints - 1);
  
  for (let i = 0; i < numPoints; i++) {
    let x = i * spacing;
    // 讓路徑在螢幕中間區域擺動
    let y = random(height * 0.3, height * 0.7);
    let gap = random(60, 100); // 增加間距，讓兩條線分開一點
    
    pointsTop.push(createVector(x, y));
    pointsBottom.push(createVector(x, y + gap));
  }
}

function drawPath() {
  push();
  // 設定發光效果
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 150, 255);
  
  stroke(50, 100, 255); // 深藍色主線
  strokeWeight(3);
  noFill();

  // 繪製平滑的上方主線
  beginShape();
  for (let p of pointsTop) {
    vertex(p.x, p.y);
  }
  endShape();

  // 繪製平滑的下方主線
  beginShape();
  for (let p of pointsBottom) {
    vertex(p.x, p.y);
  }
  endShape();

  // 額外的電流特效 (隨機出現的白色電弧)
  drawElectricArc(pointsTop);
  drawElectricArc(pointsBottom);
  
  pop();
}

function drawElectricArc(points) {
  // 隨機機率觸發電流閃爍 (降低機率讓它看起來更像突發電弧)
  if (random(1) > 0.6) {
    push();
    stroke(180, 220, 255, 180); // 淺藍白色電弧
    strokeWeight(1);
    noFill();
    for (let i = 0; i < points.length - 1; i++) {
      let p1 = points[i];
      let p2 = points[i+1];
      
      // 在每段線段中間產生一個向外彈出的電弧
      beginShape();
      for (let j = 0; j <= 2; j++) {
        let t = j / 2;
        let x = lerp(p1.x, p2.x, t);
        // 只讓中間點產生隨機偏移，且偏移量加大，看起來更像電弧跳動
        let offset = (j === 1) ? random(-15, 15) : 0;
        let y = lerp(p1.y, p2.y, t) + offset;
        vertex(x, y);
      }
      endShape();
    }
    pop();
  }
}

function drawPlayer() {
  // 進入遊戲後隱藏系統滑鼠
  noCursor();
  
  push();
  // 設定圓球發光效果
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(255, 255, 0);
  
  // 繪製黃色小圓球
  fill(255, 255, 0);
  noStroke();
  circle(mouseX, mouseY, 12); // 直徑 12 像素，大小適中
  pop();
}

function checkCollision() {
  // 如果滑鼠還在起點區域（按鈕附近），先不進行碰撞偵測，防止點擊後秒殺
  if (mouseX < 20) {
    return;
  }

  // 如果滑鼠在左右邊界外，視為失敗
  if (mouseX < 0 || mouseX > width) {
    gameState = "LOSE";
    return;
  }

  // 找出目前滑鼠在哪兩個頂點段落之間
  let spacing = width / (numPoints - 1);
  let i = floor(mouseX / spacing);
  i = constrain(i, 0, numPoints - 2);

  let x1 = pointsTop[i].x;
  let x2 = pointsTop[i+1].x;
  
  // 計算當前 X 對應的上下邊界 Y 座標
  let pct = (mouseX - x1) / (x2 - x1);
  let currentTopY = lerp(pointsTop[i].y, pointsTop[i+1].y, pct);
  let currentBottomY = lerp(pointsBottom[i].y, pointsBottom[i+1].y, pct);

  // 檢查滑鼠是否碰到線條或移到線外
  if (mouseY <= currentTopY || mouseY >= currentBottomY) {
    gameState = "LOSE";
  }
}

function checkWin() {
  if (mouseX >= width - 5) {
    gameState = "WIN";
  }
}

function startGame() {
  gameState = "PLAYING";
  startBtn.hide();
}

function mousePressed() {
  if (gameState === "WIN" || gameState === "LOSE") {
    gameState = "WAIT";
    generatePath();    // 在回到等待狀態時就先產生好新路徑
    positionButton();  // 並且把按鈕移到新路徑的中間
    startBtn.show();
  }
}

function positionButton() {
  if (pointsTop.length > 0) {
    // 強制設定按鈕高度為 30，確保它在 60-100 的間距內絕對安全
    let btnHeight = 30;
    startBtn.style('height', btnHeight + 'px');
    // 取得路徑最左側起點 (索引 0) 的 Y 座標中心
    let centerY = (pointsTop[0].y + pointsBottom[0].y) / 2;
    // 將按鈕放在畫布左側，垂直居中
    startBtn.position(5, centerY - btnHeight / 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButton();
  if (gameState === "WAIT") generatePath();
}
