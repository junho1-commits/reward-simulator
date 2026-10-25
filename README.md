# 학급 보상 시뮬레이터

6학년 사회 「가계의 합리적 선택」 수업용 웹앱입니다. 모둠이 예산 15만 원 안에서 학급 보상을 고르고(먹거리·음료·활동은 1개 이상 필수, 기념품은 선택 또는 '선택 안 함'), 포기한 것(기회비용)을 영수증으로 남기고, 기획서를 만듭니다. 교사 화면에서 모든 모둠의 선택을 실시간으로 봅니다.

## 파일
| 파일 | 내용 |
|---|---|
| `index.html` | 화면 틀 |
| `config.js` | **교사가 바꾸는 곳**: Firebase 주소, 반 이름, 예산, 학생 수, 모둠 수, 교사 번호 |
| `items.js` | 품목·가격·출처 |
| `app.js` | 동작 |
| `style.css` | 디자인 |
| `img/` | 품목 사진 (`<품목 id>.jpg`) |

## 깃허브 페이지로 올리기
1. 깃허브에서 새 저장소를 만듭니다 (예: `reward-simulator`, Public).
2. **Add file → Upload files**로 이 폴더 안의 파일과 `img` 폴더를 모두 올립니다.
3. **Settings → Pages → Branch: `main` / `(root)` → Save**를 누릅니다.
4. 1~2분 뒤 `https://<깃허브아이디>.github.io/reward-simulator/` 주소가 열립니다.

## 링크
- 모둠: `…/reward-simulator/?g=1` ~ `?g=6` — 그 모둠 화면으로 바로 들어가고, 다른 모둠으로 바꾸려면 교사 번호가 필요해요.
- 교사: `…/reward-simulator/?t` — 교사 번호를 넣으면 위시리스트 투표, 모둠 현황(실시간), 설정·링크 화면이 열려요.
- 교사 화면 → 설정·링크에서 모둠별 링크를 복사할 수 있어요.

## 주의
- `config.js`의 `TEACHER_PIN`을 꼭 바꾸세요. 저장소가 공개되면 소스에서 볼 수 있으니 학생 장난을 막는 정도의 잠금이에요.
- Firebase 규칙은 `rooms/modeok-6-3` 경로만 읽고 쓸 수 있게 열려 있어요. 모둠원 칸에는 이름 대신 번호를 쓰고, 수업 뒤 교사 화면 → 설정·링크 → **모든 모둠 기록 지우기**를 눌러 주세요.
- 가격은 2026년 10월 인터넷 검색 가격이고 배달비는 빠져 있어요. 출처는 앱 아래 **사진·가격 출처 보기**에 있어요.

## 사진 출처 (위키미디어 공용)
- 치킨: Korean fried chicken 240206.jpg, Startandstar, CC0
- 피자: Pepperoni pizza- boella co. 2024-02-17.jpg, Andy Li, CC0
- 불고기버거: Bulgogi burger.jpg, Alan Chan, CC BY-SA 2.0
- 떡볶이: Garaetteok Tteokbokki.jpg, Kimseoeun2023079825, CC0
- 도넛: Glazed Ring Doughnuts.jpg, Jiddah5212, CC BY 4.0
- 핫도그: Korean potato corn dog.jpg, Beomseok, CC BY-SA 3.0
- 과자: ParknShop Supermarket potato chip bags (Hong Kong, 2023), GRSIATEOM RIOUADOW, CC0
- 아이스크림: Melona.jpg, Hyeon-Jeong Suk, CC BY 2.0
- 콜라: Coca-cola 50cl can - Italia.jpg, M0tty, CC BY-SA 3.0
- 사이다: Korea Chilsung Cider 01, Republic of Korea (KOREA.NET), CC BY-SA 2.0
- 주스: Orange juice 1 edit1.jpg, 미국 농무부, Public domain
- 바나나맛 우유: Binggrae Banana Flavored Milk 03.jpg, KOREA.NET, CC BY-SA 2.0
- 이온음료: Pocari Sweat, Canada (label), 2026-04-04.jpg, Chris Woodrich, Public domain
- 생수: Water Bottles Image.png, Thad Zajdowicz, CC0
- 할리갈리: Halli Galli.jpg, joho345, CC BY-SA 3.0
- 팝콘: Bowl of Popcorn (Unsplash).jpg, Alex Munsell, CC0
- 피구공: Dodgeball team with utility balls.jpg, Kevin N. Murphy, CC BY 2.0
- 키링: Indigenous (Ojibwe) beaded keychains.jpg, CraftyOtter, CC BY-SA 4.0

모든 사진은 크기만 줄였습니다(480×360). CC BY-SA 사진을 고친 파일은 같은 라이선스로 공유됩니다.
