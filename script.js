// --- DOM 요소 캐싱 ---
const startPage = document.getElementById('start-page');
const qnaPage = document.getElementById('qna-page');
const resultPage = document.getElementById('result-page');
const startBtn = document.getElementById('start-btn');
const questionEl = document.getElementById('question');
const answerBtns = document.querySelectorAll('.answer-btn');
const progressBar = document.querySelector('.progress-bar');
const resultNameEl = document.getElementById('result-name');
const resultFeatureEl = document.getElementById('result-feature-title');
const resultDescEl = document.getElementById('result-description');

// --- 전역 변수 설정 ---
let questions = [];
let results = {};
let scores = {};
let currentQIdx = 0;

// --- [수정됨] data.csv 파일 로드 및 파싱 ---
async function loadData() {
    try {
        const response = await fetch('data.csv'); // data.csv 파일을 불러옵니다.
        const csvData = await response.text();
        
        const rows = csvData.trim().split('\n').filter(row => row.length > 0);
        
        rows.forEach(row => {
            const cols = row.split(',');
            const type = cols[0];

            if (type.startsWith('Q')) {
                questions.push({
                    text: cols[1],
                    targetResult: cols[2],
                    score: parseInt(cols[3], 10),
                });
            } else if (type.startsWith('R')) {
                const resultId = type;
                results[resultId] = {
                    name: cols[1],
                    description: cols[2],
                    feature: cols[3],
                };
                scores[resultId] = 0;
            }
        });
    } catch (error) {
        console.error('data.csv 파일을 불러오거나 파싱하는 데 실패했습니다.', error);
        alert('data.csv 파일을 불러오는 데 실패했습니다. Live Server로 실행했는지 확인해주세요.');
    }
}


// --- UI 및 로직 함수 (이하 변경 없음) ---
function startTest() {
    // 시작 페이지의 문항 수를 동적으로 업데이트
    const startPageDesc = document.querySelector('#start-page p');
    if(questions.length > 0) {
        startPageDesc.textContent = `총 ${questions.length}개의 문항을 통해 당신의 성향을 분석해 드립니다.`;
    }

    startPage.style.display = 'none';
    qnaPage.style.display = 'block';
    displayNextQuestion();
}

function displayNextQuestion() {
    if (currentQIdx < questions.length) {
        const question = questions[currentQIdx];
        questionEl.innerText = question.text;
        updateProgressBar();
    } else {
        showFinalResult();
    }
}

function handleAnswer(isYes) {
    if (isYes) {
        const question = questions[currentQIdx];
        const target = question.targetResult;
        const score = question.score;
        if (scores.hasOwnProperty(target)) {
            scores[target] += score;
        }
    }
    currentQIdx++;
    displayNextQuestion();
}

function showFinalResult() {
    qnaPage.style.display = 'none';
    resultPage.style.display = 'block';

    const maxScore = Math.max(...Object.values(scores));
    const topResults = Object.keys(scores).filter(key => scores[key] === maxScore);

    if (topResults.length > 1) {
        topResults.sort((a, b) => {
            const numA = parseInt(a.slice(1), 10);
            const numB = parseInt(b.slice(1), 10);
            return numA - numB;
        });
    }

    const finalResultId = topResults[0];
    const finalResult = results[finalResultId];

    if (finalResult) {
        resultNameEl.innerText = finalResult.name;
        resultFeatureEl.innerText = finalResult.feature;
        resultDescEl.innerText = finalResult.description;
    } else {
        resultNameEl.innerText = '결과를 찾을 수 없습니다.';
        resultDescEl.innerText = '데이터를 확인해주세요.';
    }
}

function updateProgressBar() {
    const progressPercentage = (currentQIdx / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// --- 이벤트 리스너 설정 ---
async function initialize() {
    await loadData(); // 데이터 로딩이 끝날 때까지 기다립니다.
    startBtn.addEventListener('click', startTest);
    answerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isYes = btn.dataset.answer === 'yes';
            handleAnswer(isYes);
        });
    });
}

initialize();