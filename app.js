const videoElement = document.querySelector('.input_video');
const maskElement = document.getElementById('mask');
const sttTextElement = document.getElementById('stt-text');
const startBtn = document.getElementById('start-btn');
const overlayStart = document.getElementById('start-overlay');

let speechRecognition = null;

// 얼굴 좌표 부드럽게 만들기 (선형 보간법 - Lerp)
let currentFaceX = window.innerWidth / 2;
let currentFaceY = window.innerHeight / 2;
let targetFaceX = window.innerWidth / 2;
let targetFaceY = window.innerHeight / 2;

// 얼굴 크기에 따른 마스크 면적 조절 변수 (기본 15%)
let currentFaceSize = 15;
let targetFaceSize = 15;

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// 매 프레임마다 마스크 위치 및 크기를 렌더링 (CSS 그라데이션)
function animateMask() {
  currentFaceX = lerp(currentFaceX, targetFaceX, 0.1);
  currentFaceY = lerp(currentFaceY, targetFaceY, 0.1);
  currentFaceSize = lerp(currentFaceSize, targetFaceSize, 0.1);

  // 마스크 그라데이션 업데이트
  // 투명한 영역 뿐만 아니라 흰색 그라데이션이 시작/끝나는 범위도 얼굴 크기에 비례해서 스케일링
  const transparentEnd = currentFaceSize;
  const semiWhiteEnd = currentFaceSize * 2.0; 
  const solidWhiteStart = currentFaceSize * 4.0;

  maskElement.style.background = `radial-gradient(circle at ${currentFaceX}px ${currentFaceY}px, transparent ${transparentEnd}%, rgba(255, 255, 255, 0.4) ${semiWhiteEnd}%, rgba(255, 255, 255, 1) ${solidWhiteStart}%)`;

  requestAnimationFrame(animateMask);
}

// MediaPipe Face Detection 콜백
function onResults(results) {
  if (results.detections.length > 0) {
    const detection = results.detections[0]; // 화면에서 가장 큰 얼굴 1개
    const boundingBox = detection.boundingBox;
    
    // boundingBox 좌표는 0~1 사이의 정규화된 값.
    // video가 scaleX(-1)로 좌우 반전되어 있으므로 x 좌표도 반전해줘야 얼굴을 정확히 따라감
    const xCenter = boundingBox.xCenter;
    const yCenter = boundingBox.yCenter;
    
    // 얼굴 너비를 기준으로 화면 대비 백분율(%) 크기 계산
    // 얼굴이 가까워지면 width가 커지고, 멀어지면 작아짐. 곱하는 값을 조절해 자연스러운 비율로 튜닝.
    const faceWidth = boundingBox.width;
    targetFaceSize = Math.max(10, Math.min(50, faceWidth * 50)); 

    // 화면 비율에 맞게 픽셀 좌표로 변환
    const invertedX = 1 - xCenter; 
    targetFaceX = invertedX * window.innerWidth;
    targetFaceY = yCenter * window.innerHeight;
  }
}

// MediaPipe 모델 초기화
const faceDetection = new FaceDetection({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
}});

faceDetection.setOptions({
  model: 'short', // 'short' 모델: 카메라에 가까운 얼굴 (2m 이내) 인식 최적화
  minDetectionConfidence: 0.5
});

faceDetection.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceDetection.send({image: videoElement});
  },
  width: 1280,
  height: 720
});

// STT (Web Speech API) 초기화 함수
function initSTT() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    sttTextElement.textContent = "현재 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 권장합니다.";
    return;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = 'ko-KR';
  speechRecognition.continuous = true; // 끊기지 않고 계속 듣기
  speechRecognition.interimResults = true; // 말하는 중간에도 결과 반환 (실시간 체감)

  speechRecognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript !== '') {
      // 말하기가 끝난 완전한 문장 (고대비 노란색)
      sttTextElement.innerHTML = `"${finalTranscript}"`;
      sttTextElement.style.color = "#fbbf24"; 
    } else if (interimTranscript !== '') {
      // 말하는 중인 문장 (회색, 아직 완성되지 않음)
      sttTextElement.innerHTML = `"${interimTranscript}"`;
      sttTextElement.style.color = "#a1a1aa"; 
    }
  };

  speechRecognition.onerror = (event) => {
    console.error("STT Error:", event.error);
    if (event.error === 'not-allowed') {
      sttTextElement.textContent = "마이크 권한이 거부되었습니다.";
    }
  };

  speechRecognition.onend = () => {
    // 음성 인식이 끊기면 다시 시작하도록 재귀 호출 (무한 루프)
    try {
      speechRecognition.start();
    } catch (e) {}
  };
}

// '시작하기' 버튼 클릭 이벤트 (카메라 및 마이크 권한 요청)
startBtn.addEventListener('click', async () => {
  // 시작 화면 숨기기
  overlayStart.style.opacity = '0';
  setTimeout(() => overlayStart.style.display = 'none', 300);
  
  // 얼굴 추적 마스크 애니메이션 루프 시작
  animateMask();

  try {
    // 카메라 켜기
    await camera.start();
    
    // STT 켜기
    initSTT();
    if (speechRecognition) {
      speechRecognition.start();
      sttTextElement.textContent = "말씀을 시작해주세요...";
    }
  } catch (err) {
    alert("카메라 또는 마이크 권한을 허용해주세요!");
    console.error(err);
  }
});
