// --- 전역 변수 및 상수 ---
const stages = document.querySelectorAll('.stage');
let gameLoopId;
let timerInterval;

// --- 1. 유틸리티 함수: 단계 전환 ---
function showStage(stageId) {
    stages.forEach(stage => {
        stage.classList.remove('active');
    });

    const activeStage = document.getElementById(stageId);
    if (activeStage) {
        activeStage.classList.add('active');
    }

    // 배경 변경 로직 (Stage 2 진입 시 back-2로 변경, 그 외엔 back-1)
    if (stageId === 'stage-2') {
        document.body.classList.remove('back-1');
        document.body.classList.add('back-2');
    } else {
        document.body.classList.remove('back-2');
        document.body.classList.add('back-1');
    }
}

// --- 2. 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    // [수정됨] 저장된 기록 상관없이 항상 인트로 시작
    initIntro();
});

// --- 3. 단계별 로직 ---

function initIntro() {
    showStage('intro');
    document.getElementById('btn-start-ritual').addEventListener('click', () => {
        showStage('stage-1');
        initStage1(); 
    });
}

// --- 비주얼 노벨 관련 ---
const dialogueData = [
    "어서 오십시오, 길을 잃은 어린 양이여.",
    "그대의 혀는... 오랫동안 거짓된 맛에 속아왔군요.",
    "페퍼로니의 자극적인 짠맛, 치즈의 느끼한 기름기...",
    "그것들은 모두 진정한 '단짠'의 조화를 가리는 불순물일 뿐입니다.",
    "자, 이제 그대의 의지를 보여주십시오.",
    "저 역겨운 우상들을 그대의 손으로 직접 파괴하고, 정화의 길로 나아가십시오!"
];
let currentDialogueIndex = 0;
let isTyping = false;
let typingTimeout;

function initStage1() {
    document.getElementById('idol-destruction-interface').style.display = 'none';
    document.getElementById('vn-layer').style.display = 'block';
    document.getElementById('stage-1').classList.add('vn-stage');
    startDialogue();
}

function startDialogue() {
    currentDialogueIndex = 0;
    showNextDialogue();
    const vnLayer = document.getElementById('vn-layer');
    vnLayer.onclick = () => {
        if (isTyping) {
            completeTyping();
        } else {
            showNextDialogue();
        }
    };
}

function showNextDialogue() {
    if (currentDialogueIndex < dialogueData.length) {
        const text = dialogueData[currentDialogueIndex];
        typeWriter(text);
        currentDialogueIndex++;
    } else {
        endDialogue();
    }
}

function typeWriter(text) {
    const textEl = document.getElementById('vn-text');
    const indicator = document.querySelector('.next-indicator');
    textEl.textContent = '';
    indicator.style.display = 'none';
    isTyping = true;

    let i = 0;
    function type() {
        if (i < text.length) {
            textEl.textContent += text.charAt(i);
            i++;
            typingTimeout = setTimeout(type, 50); 
        } else {
            isTyping = false;
            indicator.style.display = 'block'; 
        }
    }
    type();
}

function completeTyping() {
    clearTimeout(typingTimeout);
    const textEl = document.getElementById('vn-text');
    textEl.textContent = dialogueData[currentDialogueIndex - 1]; 
    isTyping = false;
    document.querySelector('.next-indicator').style.display = 'block';
}

function endDialogue() {
    document.getElementById('vn-layer').style.display = 'none';
    document.getElementById('stage-1').classList.remove('vn-stage');
    const destructionInterface = document.getElementById('idol-destruction-interface');
    destructionInterface.style.display = 'block';
    destructionInterface.style.animation = 'fadeIn 1s';
    initIdolDestruction();
}

// 우상 파괴 로직
function initIdolDestruction() {
    const idols = document.querySelectorAll('.idol-wrapper');
    const nextBtn = document.getElementById('btn-to-stage-2');
    const feedback = document.getElementById('idol-feedback');
    let destroyedCount = 0;

    idols.forEach(idol => {
        idol.addEventListener('click', () => {
            if (!idol.classList.contains('destroyed')) {
                idol.classList.add('destroyed');
                destroyedCount++;
                const pizzaName = idol.dataset.name;
                feedback.textContent = `'${pizzaName}'의 우상을 파괴했습니다.`;

                if (destroyedCount === idols.length) {
                    feedback.textContent = "모든 우상을 파괴했습니다. 그대의 의지가 증명되었습니다.";
                    nextBtn.disabled = false;
                }
            }
        });
    });

    nextBtn.addEventListener('click', () => {
        showStage('stage-2');
        initStage2(); 
    });
}

/**
 * 2단계: 성스러운 피자 수호 (통합 게임)
 */
let pineapplesPlaced = 0;
let enemies = [];
let spawnRate = 120;
let frameCount = 0;
let timeLeft = 15;
const MAX_TIME = 15;
let mouseX = 0, mouseY = 0;

function initStage2() {
    pineapplesPlaced = 0;
    enemies = [];
    spawnRate = 120;
    frameCount = 0;
    timeLeft = 15;
    
    document.getElementById('dock').style.opacity = '1';
    document.getElementById('dock').style.transform = 'translateY(0)';
    document.getElementById('game-title').innerHTML = "성스러운 파인애플 5조각을<br>점선 위에 안착시키세요";
    document.getElementById('timer').style.display = 'none';
    document.getElementById('shield').style.display = 'none';
    
    document.getElementById('time-bar-container').style.display = 'none';
    document.getElementById('time-bar').style.width = '100%';
    document.getElementById('time-bar').classList.remove('danger');

    document.body.style.cursor = 'default';
    
    const placed = document.querySelectorAll('.placed-pineapple');
    placed.forEach(el => el.remove());

    const draggables = document.querySelectorAll('.pineapple');
    const targets = document.querySelectorAll('.target-zone');
    
    draggables.forEach(p => {
        p.style.display = 'block'; 
        p.style.opacity = '1';
        p.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', e.target.id);
            setTimeout(() => p.style.opacity = '0.5', 0);
        });
        p.addEventListener('dragend', (e) => e.target.style.opacity = '1');
    });

    targets.forEach(target => {
        target.innerHTML = ''; 
        target.style.display = 'block';

        target.addEventListener('dragover', (e) => e.preventDefault());
        target.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text');
            const draggedEl = document.getElementById(id);
            if (draggedEl) {
                draggedEl.style.display = 'none';
                
                const newPineapple = document.createElement('div');
                newPineapple.className = 'placed-pineapple';
                document.getElementById('pizza').appendChild(newPineapple);
                
                const computedStyle = window.getComputedStyle(target);
                newPineapple.style.top = computedStyle.top;
                newPineapple.style.left = computedStyle.left;

                target.style.display = 'none'; 
                pineapplesPlaced++;
                
                if (pineapplesPlaced === 5) {
                    setTimeout(startPhase2, 500);
                }
            }
        });
    });
}

function startPhase2() {
    document.getElementById('dock').style.opacity = '0';
    document.getElementById('dock').style.transform = 'translateY(100px)';
    document.getElementById('game-title').innerHTML = "민트초코로부터 15초간 피자를 사수하세요!";
    
    document.getElementById('shield').style.display = 'block';
    
    const timerEl = document.getElementById('timer');
    timerEl.style.display = 'block';
    timerEl.innerText = "15.00";
    timerEl.classList.remove('danger');

    document.getElementById('time-bar-container').style.display = 'block';
    
    document.body.style.cursor = 'none'; 
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.getElementById('shield').style.left = mouseX + 'px';
        document.getElementById('shield').style.top = mouseY + 'px';
    });

    setTimeout(() => {
        gameLoop();
        startTimer();
    }, 1000);
}

function startTimer() {
    const timerEl = document.getElementById('timer');
    const timeBar = document.getElementById('time-bar');

    timerInterval = setInterval(() => {
        timeLeft -= 0.05;
        
        const percentage = (timeLeft / MAX_TIME) * 100;
        timeBar.style.width = percentage + '%';

        if (timeLeft <= 5) {
            timerEl.classList.add('danger');
            timeBar.classList.add('danger'); 
        }
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            timeBar.style.width = '0%';
            gameWin();
        }
        timerEl.innerText = timeLeft.toFixed(2);
    }, 50);
}

class MintChoco {
    constructor() {
        this.el = document.createElement('div');
        this.el.className = 'mint-choco';
        document.body.appendChild(this.el);

        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = Math.random() * window.innerWidth; this.y = -150; }
        else if (edge === 1) { this.x = window.innerWidth + 150; this.y = Math.random() * window.innerHeight; }
        else if (edge === 2) { this.x = Math.random() * window.innerWidth; this.y = window.innerHeight + 150; }
        else { this.x = -150; this.y = Math.random() * window.innerHeight; }
        
        this.size = 120; 
        this.speed = Math.random() * 1 + 1; 
        this.vx = 0; this.vy = 0; this.isRepelled = false;
    }

    update() {
        const pCx = window.innerWidth / 2;
        const pCy = window.innerHeight / 2;

        const myCx = this.x + this.size / 2;
        const myCy = this.y + this.size / 2;

        const dx = pCx - myCx; 
        const dy = pCy - myCy;
        const distToPizza = Math.sqrt(dx*dx + dy*dy);
        const dirX = dx / distToPizza; 
        const dirY = dy / distToPizza;

        const mdx = myCx - mouseX; 
        const mdy = myCy - mouseY;
        const distToMouse = Math.sqrt(mdx*mdx + mdy*mdy);
        const shieldRadius = 100; 

        if (distToMouse < shieldRadius) {
            this.isRepelled = true;
            this.vx = (mdx / distToMouse) * 20; 
            this.vy = (mdy / distToMouse) * 20;
        } else {
            if (!this.isRepelled) { 
                this.vx = dirX * this.speed; 
                this.vy = dirY * this.speed; 
            } else {
                this.vx *= 0.92; 
                this.vy *= 0.92;
                if (Math.abs(this.vx) < 0.5 && Math.abs(this.vy) < 0.5) this.isRepelled = false;
            }
        }

        this.x += this.vx; 
        this.y += this.vy;
        this.el.style.left = this.x + 'px'; 
        this.el.style.top = this.y + 'px';

        if (distToPizza < 110) return 'HIT_PIZZA'; 
        
        if (this.x < -250 || this.x > window.innerWidth + 250 || this.y < -250 || this.y > window.innerHeight + 250) {
            if(this.isRepelled) return 'OUT';
        }
        return 'ALIVE';
    }
}

function gameLoop() {
    frameCount++;
    if (frameCount % Math.floor(spawnRate) === 0) {
        enemies.push(new MintChoco());
        if (spawnRate > 40) spawnRate -= 0.2; 
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const status = enemies[i].update();
        if (status === 'HIT_PIZZA') {
            endGame(); return;
        } else if (status === 'OUT') {
            enemies[i].el.remove(); enemies.splice(i, 1);
        }
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

function endGame() {
    clearInterval(timerInterval);
    cancelAnimationFrame(gameLoopId);
    document.body.style.cursor = 'default';
    document.getElementById('game-over').classList.add('active');
    
    document.getElementById('btn-retry').onclick = () => {
        enemies.forEach(e => e.el.remove());
        document.getElementById('game-over').classList.remove('active');
        initStage2(); 
    };
}

function gameWin() {
    clearInterval(timerInterval);
    cancelAnimationFrame(gameLoopId);
    enemies.forEach(e => e.el.remove()); 
    
    document.body.style.cursor = 'default';
    document.getElementById('shield').style.display = 'none';
    document.getElementById('time-bar-container').style.display = 'none'; 
    
    const victoryScreen = document.getElementById('victory-screen');
    victoryScreen.classList.add('active');
    
    const titles = ["과즙의 사도", "신성한 조각", "오븐의 파수꾼", "황금 혀의 시종"];
    const number = Math.floor(Math.random() * 900) + 100;
    const newName = `${titles[Math.floor(Math.random() * titles.length)]} ${number}호`;
    
    const nameEl = document.getElementById('new-cult-name');
    nameEl.textContent = "...";
    setTimeout(() => {
        nameEl.textContent = newName;
    }, 1000);

    // [수정됨] 처음으로 돌아가기
    document.getElementById('btn-restart-game').onclick = () => {
        location.reload();
    };
}