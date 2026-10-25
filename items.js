/* 품목: 21명 기준, 배송·배달비 제외. 사진은 img/<id>.jpg
   cat: food(먹거리) · drink(음료) · activity(활동) · goods(기념품) */
const ITEMS = [
  { id: "chicken",   cat: "food",     name: "후라이드 치킨",      unit: "5마리",                  calc: "1마리 21,000원 × 5",                     price: 105000, share: "약 4명당 1마리",                 pros: "모두 좋아하고 든든해요",            cons: "가장 비싸고 기름진 뒤처리가 필요해요" },
  { id: "pizza",     cat: "food",     name: "페퍼로니 피자 L",    unit: "3판 (24조각)",           calc: "1판 27,400원 × 3",                       price: 82200,  share: "1인 1조각 (3조각 남음)",         pros: "나눠 먹기 쉬워요",                  cons: "1인 1조각이라 양이 적을 수 있어요" },
  { id: "burger",    cat: "food",     name: "불고기버거",         unit: "21개",                   calc: "1개 3,800원 × 21",                       price: 79800,  share: "1인 1개",                        pros: "한 사람이 하나씩 온전히 먹어요",    cons: "식으면 맛이 떨어지고 포장 쓰레기가 많아요" },
  { id: "bunsik",    cat: "food",     name: "떡볶이 + 김밥",      unit: "떡볶이 2통 + 김밥 6줄",  calc: "떡볶이 14,000원 × 2 + 김밥 4,000원 × 6", price: 52000,  share: "1인 떡볶이 조금 + 김밥 약 3조각", pros: "가격에 비해 양이 많아요",           cons: "매운 음식을 못 먹는 친구가 있어요" },
  { id: "hotdog",    cat: "food",     name: "핫도그 (냉동)",      unit: "8개입 × 3봉 (24개)",     calc: "8개입 12,900원 × 3",                     price: 38700,  share: "1인 1개 (3개 남음)",             pros: "든든하고 하나씩 나누기 쉬워요",     cons: "전자레인지로 데우는 시간이 필요해요" },
  { id: "donut",     cat: "food",     name: "글레이즈드 도넛",    unit: "2더즌 (24개)",           calc: "12개 18,000원 × 2",                      price: 36000,  share: "1인 1개 (3개 남음)",             pros: "달콤하고 나누기 쉬워요",            cons: "너무 달아서 싫어하는 친구도 있어요" },
  { id: "snack",     cat: "food",     name: "과자 종합 선물세트", unit: "33봉",                   calc: "세트 1개 29,860원",                      price: 29860,  share: "1인 1봉 (12봉 남음)",            pros: "여러 가지 맛을 골라 먹어요",        cons: "쓰레기가 많이 나와요" },
  { id: "icecream",  cat: "food",     name: "메로나 아이스크림",  unit: "40개 1상자",             calc: "40개 19,900원",                          price: 19900,  share: "1인 1개 (19개 남음)",            pros: "싸고 뒤처리가 쉬워요",              cons: "쌀쌀한 날엔 별로이고 녹기 쉬워요" },

  { id: "cola",      cat: "drink",    name: "콜라 (캔)",          unit: "245ml × 30캔",           calc: "30캔 11,290원",                          price: 11290,  share: "1인 1캔 (9캔 남음)",             pros: "싸고 시원해요",                     cons: "탄산과 설탕이 많아요" },
  { id: "cider",     cat: "drink",    name: "사이다 (캔)",        unit: "250ml × 30캔",           calc: "30캔 22,560원",                          price: 22560,  share: "1인 1캔 (9캔 남음)",             pros: "깔끔하고 대부분 좋아해요",          cons: "콜라보다 비싸요" },
  { id: "juice",     cat: "drink",    name: "과일 주스 (팩)",     unit: "190ml × 24팩 (4가지 맛)", calc: "24팩 15,420원",                         price: 15420,  share: "1인 1팩 (3팩 남음)",             pros: "맛을 골라 마실 수 있어요",          cons: "양이 조금 적어요" },
  { id: "banana",    cat: "drink",    name: "바나나맛 우유",      unit: "240ml × 24개",           calc: "24개 32,000원",                          price: 32000,  share: "1인 1개 (3개 남음)",             pros: "모두 좋아하는 인기 음료예요",       cons: "음료 가운데 가장 비싸요" },
  { id: "ion",       cat: "drink",    name: "이온음료 (캔)",      unit: "240ml × 30캔",           calc: "30캔 18,800원",                          price: 18800,  share: "1인 1캔 (9캔 남음)",             pros: "운동한 뒤 마시기 좋아요",           cons: "간식과는 잘 안 어울릴 수 있어요" },
  { id: "water",     cat: "drink",    name: "생수",               unit: "500ml × 40병",           calc: "20병 4,390원 × 2",                       price: 8780,   share: "1인 1병 (19병 남음)",            pros: "가장 싸고 건강해요",                cons: "특별한 느낌이 없어요" },

  { id: "boardgame", cat: "activity", name: "할리갈리 보드게임",  unit: "2세트",                  calc: "1세트 14,600원 × 2",                     price: 29200,  share: "한 번에 10명 정도 함께 해요",    pros: "교실에 남아 계속 쓸 수 있어요",     cons: "한 번에 모두 할 수는 없어요" },
  { id: "movie",     cat: "activity", name: "교실 영화 + 팝콘",   unit: "전자레인지 팝콘 24봉",   calc: "12봉 10,380원 × 2",                      price: 20760,  share: "1인 1봉 (3봉 남음)",             pros: "모두 함께 즐길 수 있어요",          cons: "수업 시간 2시간이 필요해요" },
  { id: "ball",      cat: "activity", name: "소프트 피구공",      unit: "1개",                    calc: "1개 15,300원",                           price: 15300,  share: "모두 함께 써요 (계속 남아요)",   pros: "오래 쓰고 몸을 움직여요",           cons: "운동을 싫어하는 친구도 있어요" },

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
  "글레이즈드 도넛: 크리스피크림 오리지널 글레이즈드 더즌 정상가 18,000원(2026.7 보도)",
  "핫도그: 쿠팡 '명랑 오리지널 핫도그(냉동) 85g 8개입' 12,900원",
  "과자: 쿠팡 '인기스낵 종합과자선물세트 33p' 29,860원",
  "아이스크림: 쿠팡 '빙그레 메로나 75ml 40개' 19,900원",
  "콜라: 쿠팡 '코카콜라 캔 업소용 245ml 30개' 11,290원",
  "사이다: 쿠팡 '롯데 칠성사이다 250ml 30개' 22,560원",
  "과일 주스: 쿠팡 '델몬트 팩주스 24개(오렌지·포도·망고·사과)' 15,420원",
  "바나나맛 우유: 쿠팡 '빙그레 바나나맛우유 240ml 24개' 32,000원",
  "이온음료: 쿠팡 '포카리스웨트 240ml 30개' 18,800원",
  "생수: 쿠팡 '스파클 생수 500ml 20개' 4,390원",
  "할리갈리: 쿠팡 '코리아보드게임즈 아미고 할리갈리' 14,600원",
  "전자레인지 팝콘: 쿠팡 '전자레인지용 팝콘 오리지날 70g 12개' 10,380원",
  "소프트 피구공: 쿠팡 '아이워너 PU 피구공 3호' 15,300원",
  "비즈 키링 만들기 키트: 쿠팡 '가방고리 키링만들기 30인용 비즈 DIY' 45,000원"
];
const PHOTO_CREDITS = [
  "치킨: Korean fried chicken 240206.jpg, Startandstar, CC0",
  "피자: Pepperoni pizza- boella co. 2024-02-17.jpg, Andy Li, CC0",
  "불고기버거: Bulgogi burger.jpg, Alan Chan, CC BY-SA 2.0",
  "떡볶이: Garaetteok Tteokbokki.jpg, Kimseoeun2023079825, CC0",
  "핫도그: Korean potato corn dog.jpg, Beomseok, CC BY-SA 3.0",
  "도넛: Glazed Ring Doughnuts.jpg, Jiddah5212, CC BY 4.0",
  "과자: ParknShop Supermarket potato chip bags (Hong Kong, 2023), GRSIATEOM RIOUADOW, CC0",
  "아이스크림: Melona.jpg, Hyeon-Jeong Suk, CC BY 2.0",
  "콜라: Coca-cola 50cl can - Italia.jpg, M0tty, CC BY-SA 3.0",
  "사이다: Korea Chilsung Cider 01, Republic of Korea (KOREA.NET), CC BY-SA 2.0",
  "주스: Orange juice 1 edit1.jpg, 미국 농무부, Public domain",
  "바나나맛 우유: Binggrae Banana Flavored Milk 03.jpg, KOREA.NET, CC BY-SA 2.0",
  "이온음료: Pocari Sweat, Canada (label), 2026-04-04.jpg, Chris Woodrich, Public domain",
  "생수: Water Bottles Image.png, Thad Zajdowicz, CC0",
  "할리갈리: Halli Galli.jpg, joho345, CC BY-SA 3.0",
  "팝콘: Bowl of Popcorn (Unsplash).jpg, Alex Munsell, CC0",
  "피구공: Dodgeball team with utility balls.jpg, Kevin N. Murphy, CC BY 2.0",
  "키링: Indigenous (Ojibwe) beaded keychains.jpg, CraftyOtter, CC BY-SA 4.0",
  "모든 사진은 위키미디어 공용(commons.wikimedia.org)에서 가져와 크기만 줄였어요."
];
