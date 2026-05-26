# 🚀 LookWho: Market HUD (마켓 허드)

> **완벽한 몰입. 더 깊은 대화**  
> MediaPipe FaceMesh와 Web Speech API(STT)를 결합한 실시간 지능형 시네마틱 마켓 HUD 서비스입니다.

본 프로젝트는 카메라를 통해 사용자의 얼굴을 실시간으로 추적하여 시네마틱 마스킹 레이어를 입히고, 자연어 발화를 분석하여 등록된 상품의 수량 및 가격 정보를 우아한 트랜지션 애니메이션과 함께 실시간 HUD(Heads-Up Display)로 표출하는 혁신적인 웹캠 기반 인터랙티브 SPA(Single Page Application)입니다.

---

## 🔗 Live Demo (배포 링크)
> GitHub Pages를 통해 배포된 실제 실행 주소입니다.  
> **실행 주소:** `https://<YOUR-GITHUB-USERNAME>.github.io/market-hud/`  
> *(※ 배포된 GitHub Repository의 Settings > Pages 탭에서 Pages를 활성화하여 생성된 배포 URL을 기재해 제출하세요)*

---

## ✨ 핵심 구현 기능 (Core Features)

### 1. 실시간 FaceMesh 기반 시네마틱 마스킹
* **인공지능 얼굴 분석:** Google MediaPipe FaceMesh API를 로드하여 다중 화자의 눈, 코, 입 좌표 및 얼굴 영역 크기를 실시간 분석합니다.
* **동적 마스킹:** 사용자 얼굴 위치에 맞추어 배경 노이즈 및 다크 비네팅 레이어의 투명 그라데이션 영역을 프레임 단위로 선형 보간(`Lerp`) 처리해, 화자에게 시선이 가도록 고급스러운 글래스모피즘 포커스 효과를 부여합니다.

### 2. 엄격한 자연어 처리 기반 품목/수량 요약 알고리즘
* **미등록 품목 차단:** `priceDB`에 등록되지 않은 임의의 상품 발화는 화면 노출을 완전히 차단합니다.
* **필러(Filler) 및 요청어 제거:** `"어"`, `"음"`, `"저기"`, `"혹시"`, `"좀"`, `"그러니까"` 등의 의미 없는 간투사와 `"주세요"`, `"부탁해요"` 같은 문장 결미 표현을 지능적으로 정제합니다.
* **수사(한글 수량) 숫자 치환:** `"하나/한"` ➔ `1`, `"두/둘"` ➔ `2` 등의 한글 수사 표현을 아라비아 숫자로 정식 치환합니다.
* **다중 상품 매칭 및 병렬 정렬:** 한 문장 내에서 여러 상품이 발화된 경우, 음성에서 등장한 순서대로 슬래시 구분자(` / `)를 활용해 병합 출력합니다. (예: `사과 1봉지 / 깻잎 2단`)
* **추측 정보 방지:** 수량이 아예 명시되지 않은 발화는 수량을 임의 추측하여 생성하지 않고 `[상품명]` 자체만 담백하게 출력합니다.

### 3. 시네마틱 페이드인/아웃 자막 & 가격 HUD
* **완결성 기반 노출:** 음성 인식이 도는 중에는 턱 밑의 풀 자막만 보이며, **말이 완벽하게 끝난 시점(`isFinal`)에만** 머리 위에 요약 단어가 슥 떠오르도록 정교하게 스크립팅했습니다.
* **부드러운 이징(Transition) 연동:** 머리 위 요약과 하단 자막에 `alpha Lerp(계수 0.04~0.05)` 상태 머신을 설계하여, 텍스트가 안개 속에서 드러나듯 아주 은은하게 페이드인/아웃됩니다.
* **애플 스타일 슬라이딩 가격 HUD:** 가격 정보가 갱신될 때 이전 팝업이 부드럽게 내려간 뒤 새 가격이 솟아오르도록 설계했습니다. (`0.55s cubic-bezier(.16, 1, .3, 1)` 적용). 7초간 유지된 후 가격 HUD가 내려갈 때 머리 위 요약 단어도 동시에 은은하게 스며들며 동시 소멸합니다.

### 4. 카메라/마이크 리소스 라이프사이클 관리
* **`← 처음으로` 복귀 버튼:** 실사용 중 화면 좌측 상단에 어드민 패널과 대칭되는 플랫 블루-화이트의 뒤로가기 단추를 배치했습니다.
* **리소소 반환:** 복귀 시 카메라 피드(`cam.stop()`)와 마이크 센서(`recognition.stop()`) 작동을 완벽히 소거하여 리소스 누수를 방지합니다.

---

## 🛠️ 기술 스택 (Tech Stack)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **AI Model:** Google MediaPipe FaceMesh (`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh`)
* **Speech Engine:** Web Speech API (`SpeechRecognition`)
* **Platform:** GitHub Pages (Static Web Hosting)

---

## 📂 파일 구조 (Repository Structure)
```bash
market-hud/
├── index.html     # HTML 구조, CSS 스타일 및 Core JS 로직이 통합 내장된 메인 배포 파일
├── app.js         # 미디어파이프 및 카메라 권한 제어 백업 파일
├── style.css      # 로컬 개발용 스타일 백업 시트
└── README.md      # 본 설명서 파일 (제출 시 깃허브 저장소 얼굴 역할)
```

---

## 🚀 배포 방법 (GitHub Pages Deploy Guide)

본 프로젝트는 서버 사이드 언어(Node.js, Python 등)나 빌드 도구(`npm run build`)가 필요 없는 **순수 정적 웹 브라우저 애플리케이션**입니다. 따라서 깃허브 웹 서버 상에 올리는 즉시 호스팅 배포가 완료됩니다.

1. 본인의 GitHub에 신규 리포지토리를 생성합니다 (예: `market-hud`).
2. 로컬 디렉토리의 파일들을 해당 리포지토리에 push합니다.
   ```bash
   git init
   git add .
   git commit -m "feat: LookWho Market HUD premium release"
   git branch -M main
   git remote add origin https://github.com/본인유저명/market-hud.git
   git push -u origin main
   ```
3. GitHub 리포지토리 페이지로 이동하여 **`Settings` ➔ `Pages`** 탭을 클릭합니다.
4. **Build and deployment** 항목의 **Branch** 설정을 `None`에서 `main` (또는 `master`) / `/ (root)` 폴더로 설정한 후 **Save**를 클릭합니다.
5. 약 1~2분 후 페이지 상단에 나타나는 실행 링크(`https://본인유저명.github.io/market-hud/`)를 복사하여 과제 제출란에 기재하면 배포 가능한 깃허브 형식 제출이 완수됩니다.
