const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");
function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(scale, scale);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const scaleFactor = canvas.width / 1920; 

const aim = new Image();
aim.src = 'resources/aim.png';
const boardBG = new Image();
boardBG.src = 'resources/board-bg.jpg';
const emptyHeart = new Image();
emptyHeart.src = 'resources/empty_heart.png';
const fullHeart = new Image();
fullHeart.src = 'resources/full_heart.png';
const zombieImg = new Image();
zombieImg.src = 'resources/walkingdead.png';
const sadMusic = new Audio("resources/sad-music.mp3");
const shotSound = new Audio('resources/shot-sound.mp3');
const music = new Audio('resources/music.mp3')



let lives = 3;
let score = 0;
let zombies = [];
let zombiespawn;
let gameOver = false;
let framesMax = 9;
const cursorImage = new Image();
cursorImage.src = 'resources/aim.png';
cursorImage.onload = () => {
    const smallCanvas = document.createElement('canvas');
    const smallCtx = smallCanvas.getContext('2d');
    const targetSize = 64; 
    smallCanvas.width = targetSize;
    smallCanvas.height = targetSize;
    smallCtx.drawImage(cursorImage, 0, 0, targetSize, targetSize);
    canvas.style.cursor = `url(${smallCanvas.toDataURL()}), auto`;
};

class Zombie 
{
    constructor() 
    {
      this.x = canvas.width;
      this.width = (50 + Math.random() * 200) * scaleFactor;
      this.height = this.width * 1.5;
      this.y = canvas.height - this.height - Math.random() * 400 * scaleFactor;
      this.speed = (2 + Math.random() * 5) * scaleFactor;
      this.hit = false; 
      this.frameWidth = 200; 
      this.frameHeight = 312;
      this.currentFrame = 0; 
      
    }
    animation()
    {
        if (this.currentFrame >= framesMax) 
        {
            this.currentFrame = -1; 
        }
        this.currentFrame +=1;
        const cutX = this.currentFrame * this.frameWidth; 
        c.drawImage(zombieImg, cutX, 0, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
    }
    update()
    {
        this.x-=this.speed/1.5;
    }
}


function drawHUD()
{
    for(let i=0; i<3;i++)
    {
        const heartSize = 100 * scaleFactor;
        if(i<lives)
        {
            c.drawImage(fullHeart, 20 * scaleFactor + i * 120 * scaleFactor, 10 * scaleFactor, heartSize, heartSize);
        }
        else
        {
            c.drawImage(emptyHeart, 20 * scaleFactor + i * 120 * scaleFactor, 10 * scaleFactor, heartSize, heartSize);
        }
    }
    c.fillStyle = "white";
    c.font = `${100 * scaleFactor}px Arial`;
    c.fillText(`${score}`, canvas.width - 215 * scaleFactor, 80 * scaleFactor);
}

function gameEnd()
{
    music.pause();
    sadMusic.currentTime = 0;
    zombies=[];
    gameOver=true;
    clearInterval(zombiespawn);
    popup();
    sadMusic.play();
    canvas.addEventListener('click',button);

}
function button(event)
{
    if(gameOver ===true)
    {
        const buttonWidth = 1500;
        const buttonHeight = 500;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - 250;
        const mouseY = event.clientY - rect.top -128;
        const buttonX = (canvas.width-buttonWidth)/2; 
        const buttonY = (canvas.height -buttonHeight)/ 2;          

        if (mouseX >= buttonX&&mouseX <= buttonX  + buttonWidth &&mouseY >= buttonY &&mouseY <= buttonY + buttonHeight)
        {
            gameStart();
        }
    }

}
function popup() {
    c.fillStyle = 'green';
    c.fillRect(canvas.width / 4, canvas.height / 2.5, canvas.width / 2, canvas.height / 6);
    c.fillStyle = "white";
    c.font = `${50 * scaleFactor}px Arial`;
    c.fillText("Play again", canvas.width / 2.3, canvas.height / 2);
}
function shot(event) {
    if (!gameOver) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left+16) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top+32) * (canvas.height / rect.height);
        shotSound.currentTime=0.2;
        shotSound.volume=0.5;
        shotSound.play();

        for (let i = 0; i < zombies.length; i++) {
            const zombie = zombies[i];
            if (mouseX >= zombie.x && mouseX <= zombie.x + zombie.width && mouseY >= zombie.y && mouseY <= zombie.y + zombie.height) {
                zombies.splice(i, 1);
                score += 20;
                return;
            }
        }
        if (score >= 5) {
            score -= 5;
        }
    }
}
function gameLoop()
{

    c.clearRect(0, 0, canvas.width, canvas.height);
    drawHUD();
    
    if(lives===0)
        {
            gameEnd();
        }
    if(gameOver===false)
    {
        for(let i = 0;i<zombies.length;i++)
        {
            if(zombies[i].x<=0)
                {
                     lives-=1;
                    zombies.splice(i,1);
                }
                else
                {
                    zombies[i].animation();
                    zombies[i].update();
                }
            }
        requestAnimationFrame(gameLoop);
    }  
}
function gameStart() {
    sadMusic.pause();
    music.currentTime=0;
    music.volume=0.3
    music.play();
    lives = 3;
    score = 0;
    zombies = [];
    gameOver = false;
    
    let spawnRate = 1000;

    function spawnZombie() {
        if (!gameOver) {
            zombies.push(new Zombie());
            setTimeout(spawnZombie, spawnRate);
        }
    }

    function increaseDifficulty() {
        if (spawnRate > 300) {
            spawnRate -= 50;
            setTimeout(increaseDifficulty, 3000);
        }
    }

    spawnZombie();
    increaseDifficulty();

    requestAnimationFrame(gameLoop);
    canvas.addEventListener('click', shot);
}

gameStart();
