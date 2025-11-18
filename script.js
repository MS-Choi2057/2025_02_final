// --- 전역 변수 및 상수 ---
const stages = document.querySelectorAll('.stage');

// --- 1. 유틸리티 함수: 단계 전환 ---
function showStage(stageId) {
    // 모든 단계를 숨김
    stages.forEach(stage => {
        stage.classList.remove('active');
    });

    // 특정 단계만 표시
    const activeStage = document.getElementById(stageId);
    if (activeStage) {
        activeStage.classList.add('active');
    }

    // *** [배경 변경 로직] ***
    if (stageId === 'sanctuary') {
        document.body.classList.remove('back-1');
        document.body.classList.add('back-2');
    } else {
        document.body.classList.remove('back-2');
        document.body.classList.add('back-1');
    }
}

// --- 2. 초기화 및 영속성 ---
document.addEventListener('DOMContentLoaded', () => {
    // 새로고침 시 무조건 리셋
    localStorage.removeItem('cultName'); 
    initIntro();
});

// --- 3. 단계별 초기화 함수 ---

/**
 * 인트로: 교단 소개
 */
function initIntro() {
    showStage('intro'); 
    const startBtn = document.getElementById('btn-start-ritual');
    startBtn.addEventListener('click', () => {
        showStage('stage-1');
        initStage1(); 
    });
}

/**
 * 1단계: 참회의 방 (우상 파괴)
 */
function initStage1() {
    const idols = document.querySelectorAll('.idol');
    const nextBtn = document.getElementById('btn-to-stage-2');
    const feedback = document.getElementById('idol-feedback');
    let destroyedCount = 0;

    nextBtn.disabled = true;
    feedback.textContent = '';
    idols.forEach(idol => idol.classList.remove('destroyed'));

    idols.forEach(idol => {
        idol.addEventListener('click', () => {
            if (!idol.classList.contains('destroyed')) {
                idol.classList.add('destroyed');
                destroyedCount++;
                feedback.textContent = `'${idol.textContent.trim()}'의 우상을 파괴했습니다.`;

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
 * 2단계: 피의 서약 (순차적 진행으로 변경됨)
 */
function initStage2() {
    const groups = document.querySelectorAll('.oath-group');
    const inputs = document.querySelectorAll('.oath-input');
    const nextBtn = document.getElementById('btn-to-stage-3');
    
    // 초기화: 첫 번째 그룹만 보이고, 버튼 비활성화
    nextBtn.disabled = true;
    groups.forEach((group, index) => {
        if (index === 0) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });

    inputs.forEach(input => {
        input.value = ''; 
        input.classList.remove('success', 'error');
        input.disabled = false;
    });

    // 입력 이벤트 리스너
    inputs.forEach((input, index) => {
        input.addEventListener('keyup', () => {
            const pledge = input.dataset.pledge;
            const value = input.value;

            if (value === pledge) {
                // 정답인 경우
                if (!input.classList.contains('success')) { 
                    input.classList.remove('error');
                    input.classList.add('success');
                    input.disabled = true; // 입력 완료 처리
                    
                    // 0.5초 뒤 다음 단계 노출
                    setTimeout(() => {
                        // 현재 그룹 숨기기 (선택사항: 남겨두고 싶으면 이 줄 삭제)
                         groups[index].style.display = 'none'; 

                        if (index < groups.length - 1) {
                            // 다음 그룹 보여주기
                            groups[index + 1].style.display = 'block';
                            // 포커스 이동
                            inputs[index + 1].focus();
                        } else {
                            // 마지막 문제까지 다 풀었으면 버튼 활성화
                            // 피드백 텍스트 변경 (선택사항)
                            document.querySelector('.speech-bubble p').textContent = "훌륭하다. 너의 진심이 닿았도다.";
                            nextBtn.disabled = false;
                        }
                    }, 500);
                }
            } else if (value.length > 0) {
                // 오답 표시
                input.classList.add('error');
                input.classList.remove('success');
            }
        });
    });

    nextBtn.addEventListener('click', () => {
        showStage('stage-3');
        initStage3();
    });
}

/**
 * 3단계: 재탄생 (이름 부여)
 */
function initStage3() {
    const nameEl = document.getElementById('new-name');
    const nextBtn = document.getElementById('btn-to-sanctuary');

    const titles = ["과즙의 사도", "신성한 조각", "오븐의 파수꾼", "황금 혀의 시종"];
    const number = Math.floor(Math.random() * 900) + 100; 
    const newName = `${titles[Math.floor(Math.random() * titles.length)]} ${number}호`;

    nameEl.textContent = "..."; 

    setTimeout(() => {
        nameEl.textContent = newName;
        localStorage.setItem('cultName', newName);

        nextBtn.addEventListener('click', () => {
            showStage('sanctuary');
            document.getElementById('welcome-message').textContent = `환영합니다, ${newName}.`;
        });
    }, 2000); 
}