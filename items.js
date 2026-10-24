/* 품목: 21명 기준, 배달비 제외. 사진은 img/<id>.jpg */
const ITEMS = [
  { id: "chicken",   cat: "food",     name: "후라이드 치킨",      unit: "5마리",                  calc: "1마리 21,000원 × 5",                     price: 105000, share: "약 4명당 1마리",                 pros: "모두 좋아하고 든든해요",            cons: "가장 비싸고 기름진 뒤처리가 필요해요" },
  { id: "pizza",     cat: "food",     name: "페퍼로니 피자 L",    unit: "3판 (24조각)",           calc: "1판 27,400원 × 3",                       price: 82200,  share: "1인 1조각 (3조각 남음)",         pros: "나눠 먹기 쉬워요",                  cons: "1인 1조각이라 양이 적을 수 있어요" },
  { id: "burger",    cat: "food",     name: "불고기버거",         unit: "21개",                   calc: "1개 3,800원 × 21",                       price: 79800,  share: "1인 1개",                        pros: "한 사람이 하나씩 온전히 먹어요",    cons: "식으면 맛이 떨어지고 포장 쓰레기가 많아요" },
  { id: "bunsik",    cat: "food",     name: "떡볶이 + 김밥",      unit: "떡볶이 2통 + 김밥 6줄",  calc: "떡볶이 14,000원 × 2 + 김밥 4,000원 × 6", price: 52000,  share: "1인 떡볶이 조금 + 김밥 약 3조각", pros: "가격에 비해 양이 많아요",           cons: "매운 음식을 못 먹는 친구가 있어요" },
  { id: "donut",     cat: "food",     name: "글레이즈드 도넛",    unit: "2더즌 (24개)",           calc: "12개 18,000원 × 2",                      price: 36000,  share: "1인 1개 (3개 남음)",             pros: "달콤하고 나누기 쉬워요",            cons: "너무 달아서 싫어하는 친구도 있어요" },
  { id: "hotdog",    cat: "food",     name: "핫도그 (냉동)",      unit: "20개",                   calc: "20개 묶음 29,990원",                     price: 29990,  share: "20개라 1명은 나눠 먹어요",       pros: "싸고 든든해요",                     cons: "전자레인지로 데우는 시간이 필요해요" },
  { id: "snack",     cat: "food",     name: "봉지과자 세트",      unit: "26종 26봉",              calc: "세트 1개 27,900원",                      price: 27900,  share: "1인 1봉 (5봉 남음)",             pros: "여러 가지 맛을 골라 먹어요",        cons: "쓰레기가 많이 나와요" },
  { id: "icecream",  cat: "food",     name: "바 아이스크림",      unit: "21개",                   calc: "1개 1,200원 × 21",                       price: 25200,  share: "1인 1개",                        pros: "싸고 뒤처리가 쉬워요",              cons: "금방 끝나고 쌀쌀한 날엔 별로예요" },
  { id: "tangerine", cat: "food",     name: "제철 감귤",          unit: "5kg 1상자",              calc: "5kg 16,900원",                           price: 16900,  share: "1인 2~3개",                      pros: "제철이라 싸고 건강에 좋아요",       cons: "특별한 간식 느낌은 덜해요" },
  { id: "boardgame", cat: "activity", name: "할리갈리 보드게임",  unit: "2세트",                  calc: "1세트 22,900원 × 2",                     price: 45800,  share: "한 번에 10명 정도 함께 해요",    pros: "교실에 남아 계속 쓸 수 있어요",     cons: "한 번에 모두 할 수는 없어요" },
  { id: "movie",     cat: "activity", name: "교실 영화 + 팝콘",   unit: "전자레인지 팝콘 20봉",   calc: "10봉 13,770원 × 2",                      price: 27540,  share: "20봉이라 1명은 나눠 먹어요",     pros: "모두 함께 즐길 수 있어요",          cons: "수업 시간 2시간이 필요해요" },
  { id: "ball",      cat: "activity", name: "소프트 피구공",      unit: "1개",                    calc: "1개 35,610원",                           price: 35610,  share: "모두 함께 써요 (계속 남아요)",   pros: "오래 쓰고 몸을 움직여요",           cons: "운동을 싫어하는 친구도 있어요" },
  { id: "keyring",   cat: "goods",    name: "키링 만들기 키트",   unit: "30인용",                 calc: "30인용 1세트 49,000원",                  price: 49000,  share: "1인 1개 직접 만들기 (9개 남음)", pros: "직접 만들어 오래 간직해요",         cons: "만드는 시간이 필요해요" }
];
const CATS = { food: "🍽️ 먹거리", activity: "🎯 활동", goods: "🎁 기념품" };

const PRICE_SOURCES = [
  "후라이드 치킨: 교촌치킨 홈페이지 권장소비자가 '후라이드한마리' 21,000원",
  "페퍼로니 피자 L: 도미노피자 홈페이지 클래식 피자 L 27,400원",
  "불고기버거: 맥도날드 2026년 2월 가격 조정 후 단품 3,800원(보도)",
  "떡볶이: 동대문엽기떡볶이 14,000원(보도) / 김밥: 서울 평균 3,923원(한국소비자원 참가격, 2026.9) → 4,000원으로 반올림",
  "글레이즈드 도넛: 크리스피크림 오리지널 글레이즈드 더즌 정상가 18,000원(2026.7 보도)",
  "핫도그: 코스트코 명랑 오리지널 핫도그 85g × 10 × 2(20개) 29,990원",
  "봉지과자 세트: 쿠팡 과자 선물세트 목록 '봉지과자 26종 세트' 27,900원",
  "바 아이스크림: 빙그레 바 아이스크림 소매가 1,200원(보도)",
  "제철 감귤: 11번가 조생감귤 5kg 16,900원",
  "할리갈리: 11번가 할리갈리 한글판 22,900원",
  "전자레인지 팝콘: 쿠팡 전자레인지용 팝콘 10개 13,770원",
  "소프트 피구공: 11번가 낫소 소프트 PU폼 피구공 4호 35,610원",
  "키링 만들기 키트: 11번가 30인용 단추 키링 키트 49,000원"
];
const PHOTO_CREDITS = [
  "치킨: Korean fried chicken 240206.jpg, Startandstar, CC0",
  "피자: Pepperoni pizza- boella co. 2024-02-17.jpg, Andy Li, CC0",
  "불고기버거: Bulgogi burger.jpg, Alan Chan, CC BY-SA 2.0",
  "떡볶이: Garaetteok Tteokbokki.jpg, Kimseoeun2023079825, CC0",
  "도넛: Glazed Ring Doughnuts.jpg, Jiddah5212, CC BY 4.0",
  "핫도그: Korean potato corn dog.jpg, Beomseok, CC BY-SA 3.0",
  "과자: ParknShop Supermarket potato chip bags (Hong Kong, 2023), GRSIATEOM RIOUADOW, CC0",
  "아이스크림: Melona.jpg, Hyeon-Jeong Suk, CC BY 2.0",
  "감귤: Mandarins - whole and halved.jpg, Ivar Leidus, CC BY-SA 4.0",
  "할리갈리: Halli Galli.jpg, joho345, CC BY-SA 3.0",
  "팝콘: Bowl of Popcorn (Unsplash).jpg, Alex Munsell, CC0",
  "피구공: Dodgeball team with utility balls.jpg, Kevin N. Murphy, CC BY 2.0",
  "키링: Indigenous (Ojibwe) beaded keychains.jpg, CraftyOtter, CC BY-SA 4.0",
  "모든 사진은 위키미디어 공용(commons.wikimedia.org)에서 가져와 크기만 줄였어요."
];
