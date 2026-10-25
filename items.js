/* 품목: 21명 기준, 배송·배달비 제외. 사진은 img/<id>.jpg
   cat: food(먹거리) · drink(음료) · activity(활동) · goods(기념품) */
const ITEMS = [
  { id: "chicken",   cat: "food",     name: "후라이드 치킨",      unit: "5마리",                  calc: "1마리 21,000원 × 5",                     price: 105000, share: "약 4명당 1마리",                 pros: "모두 좋아하고 든든해요",            cons: "가장 비싸고 기름진 뒤처리가 필요해요" },
  { id: "pizza",     cat: "food",     name: "페퍼로니 피자 L",    unit: "3판 (24조각)",           calc: "1판 27,400원 × 3",                       price: 82200,  share: "1인 1조각 (3조각 남음)",         pros: "나눠 먹기 쉬워요",                  cons: "1인 1조각이라 양이 적을 수 있어요" },
  { id: "burger",    cat: "food",     name: "불고기버거",         unit: "21개",                   calc: "1개 3,800원 × 21",                       price: 79800,  share: "1인 1개",                        pros: "한 사람이 하나씩 온전히 먹어요",    cons: "식으면 맛이 떨어지고 포장 쓰레기가 많아요" },
  { id: "bunsik",    cat: "food",     name: "떡볶이 + 김밥",      unit: "떡볶이 2통 + 김밥 6줄",  calc: "떡볶이 14,000원 × 2 + 김밥 4,000원 × 6", price: 52000,  share: "1인 떡볶이 조금 + 김밥 약 3조각", pros: "가격에 비해 양이 많아요",           cons: "매운 음식을 못 먹는 친구가 있어요" },
  { id: "snack",     cat: "food",     name: "과자 종합 선물세트", unit: "33봉",                   calc: "세트 1개 29,860원",                      price: 29860,  share: "1인 1봉 (12봉 남음)",            pros: "여러 가지 맛을 골라 먹어요",        cons: "쓰레기가 많이 나와요" },

  { id: "cola",      cat: "drink",    name: "콜라 (캔)",          unit: "245ml × 30캔",           calc: "30캔 11,290원",                          price: 11290,  share: "1인 1캔 (9캔 남음)",             pros: "싸고 시원해요",                     cons: "탄산과 설탕이 많아요" },
  { id: "cider",     cat: "drink",    name: "사이다 (캔)",        unit: "250ml × 30캔",           calc: "30캔 22,560원",                          price: 22560,  share: "1인 1캔 (9캔 남음)",             pros: "깔끔하고 대부분 좋아해요",          cons: "콜라보다 비싸요" },
  { id: "juice",     cat: "drink",    name: "과일 주스 (팩)",     unit: "190ml × 24팩 (4가지 맛)", calc: "24팩 15,420원",                         price: 15420,  share: "1인 1팩 (3팩 남음)",             pros: "맛을 골라 마실 수 있어요",          cons: "양이 조금 적어요" },
  { id: "water",     cat: "drink",    name: "생수",               unit: "500ml × 40병",           calc: "20병 4,390원 × 2",                       price: 8780,   share: "1인 1병 (19병 남음)",            pros: "가장 싸고 건강해요",                cons: "특별한 느낌이 없어요" },

  { id: "boardgame", cat: "activity", name: "보드게임", unit: "4개 모둠용 (4세트)", calc: "1세트 14,600원 × 4", price: 58400, share: "4개 모둠이 한 세트씩 사용해요", pros: "여러 모둠이 동시에 즐기고 계속 쓸 수 있어요", cons: "모둠별로 차례를 지켜 참여해야 해요" },
  { id: "movie",     cat: "activity", name: "영화 + 학습지",      unit: "VOD 1편 구입 + 학습지 21부", calc: "VOD 구입 15,000원 (예시) + 학습지 교내 인쇄", price: 15000, share: "21명 함께 감상하고 1인 1부 학습지 활동", pros: "영화를 보고 생각을 학습지로 정리해요", cons: "감상과 학습지 활동 시간이 필요해요" },
  { id: "ball",      cat: "activity", name: "소프트 피구공",      unit: "1개",                    calc: "1개 29,500원",                           price: 29500,  share: "모두 함께 써요 (계속 남아요)",   pros: "오래 쓰고 몸을 움직여요",           cons: "운동을 싫어하는 친구도 있어요" },

  { id: "keyring",   cat: "goods",    name: "비즈 키링 만들기 키트", unit: "30인용",              calc: "30인용 1세트 45,000원",                  price: 45000,  share: "1인 1개 직접 만들기 (9개 남음)", pros: "직접 만들어 오래 간직해요",         cons: "만드는 시간이 필요해요" }
];
const CATS = { food: "🍽️ 먹거리", drink: "🥤 음료", activity: "🎯 활동", goods: "🎁 기념품" };
const REQUIRED_CATS = ["food", "drink", "activity"];   // 1개 이상 꼭 담아야 하는 분류. 기념품은 '선택 안 함'도 돼요.

const PRICE_SOURCES = [
  "확인일: 2026년 10월 25일. 쇼핑몰 가격은 할인·쿠폰에 따라 매일 바뀌어요.",
  "후라이드 치킨: 교촌치킨 홈페이지 권장소비자가 '후라이드한마리' 21,000원",
  "페퍼로니 피자 L: 도미노피자 홈페이지 'L 27,400원~'",
  "불고기버거: 맥도날드 2026년 2월 가격 조정 후 단품 3,800원(보도)",
  "떡볶이: 동대문엽기떡볶이 14,000원(보도) / 김밥: 서울 평균 3,923원(한국소비자원 참가격, 2026.9) → 4,000원",
  "과자: 쿠팡 '인기스낵 종합과자선물세트 33p' 29,860원",
  "콜라: 쿠팡 '코카콜라 캔 업소용 245ml 30개' 11,290원",
  "사이다: 쿠팡 '롯데 칠성사이다 250ml 30개' 22,560원",
  "과일 주스: 쿠팡 '델몬트 팩주스 24개(오렌지·포도·망고·사과)' 15,420원",
  "생수: 쿠팡 '스파클 생수 500ml 20개' 4,390원",
  "보드게임: 수업용 단가 1세트 14,600원 × 4세트 = 58,400원 (4개 모둠용)",
  "영화 + 학습지: VOD 구입비 15,000원은 수업용 예시 금액이며 작품·판매처에 따라 달라요. 학습지 21부는 교내 인쇄를 가정해 별도 비용을 넣지 않았어요.",
  "소프트 피구공: 수업 설정 금액 29,500원 (1개)",
  "비즈 키링 만들기 키트: 쿠팡 '가방고리 키링만들기 30인용 비즈 DIY' 45,000원"
];
const PHOTO_CREDITS = [
  "치킨: Korean fried chicken 240206.jpg, Startandstar, CC0",
  "피자: Pepperoni pizza- boella co. 2024-02-17.jpg, Andy Li, CC0",
  "불고기버거: Bulgogi burger.jpg, Alan Chan, CC BY-SA 2.0",
  "떡볶이: Garaetteok Tteokbokki.jpg, Kimseoeun2023079825, CC0",
  "과자: ParknShop Supermarket potato chip bags (Hong Kong, 2023), GRSIATEOM RIOUADOW, CC0",
  "콜라: Coca-cola 50cl can - Italia.jpg, M0tty, CC BY-SA 3.0",
  "사이다: Korea Chilsung Cider 01, Republic of Korea (KOREA.NET), CC BY-SA 2.0",
  "주스: Orange juice 1 edit1.jpg, 미국 농무부, Public domain",
  "생수: Water Bottles Image.png, Thad Zajdowicz, CC0",
  "보드게임 예시 사진: Halli Galli.jpg, joho345, CC BY-SA 3.0",
  "피구공: Dodgeball team with utility balls.jpg, Kevin N. Murphy, CC BY 2.0",
  "키링: Indigenous (Ojibwe) beaded keychains.jpg, CraftyOtter, CC BY-SA 4.0",
  "모든 사진은 위키미디어 공용(commons.wikimedia.org)에서 가져와 크기만 줄였어요."
];
