/* ARCANA — 브랜드 데이터
   서랍(기능) 4 × 카테고리(제형) 5 = 20개 제품. N°00 달맞이꽃은 모든 제품의 공통 베이스. */

const BASE = {
  no: '00',
  fr: "L'Arcanum · Onagre",
  ko: '달맞이꽃',
  origin: '북아메리카 들판',
  img: 'assets/img/onagre.jpg',
  story:
    '해가 지평선 아래로 내려가면 달맞이꽃은 몇 분 만에 꽃잎을 연다. 낮 동안 꼭 닫혀 있던 꽃은 달빛 아래에서만 피어나, 밤의 나방에게만 비밀을 열어 보이고 아침이 오면 진다. 유럽에 닿은 뒤에는 ‘왕의 만병통치약(King’s cure-all)’이라 불렸다. ARCANA의 모든 처방은 이 꽃에서 시작된다.',
  benefit: '종자유의 감마리놀렌산(GLA)·리놀레산이 장벽을 채우고 보습·탄력을 돕는다. 어떤 서랍을 열든 공통으로 깔리는 바탕.',
};

const DRAWERS = [
  {
    no: '01', fr: 'Mûrier Blanc', ko: '화이트 멀베리 뿌리', concern: '미백·톤', concernEn: 'Tone & Clarity',
    origin: '사마르칸트, 우즈베키스탄', sound: '스르륵', co: '시벅턴',
    coNote: '히말라야 라다크 고원의 강한 햇빛을 견딘 주황빛 열매. 지친 얼굴에 생기 어린 빛을 더한다.',
    petal: '#EDE4B5', accent: '#C9B98A', line: '#EDE4B5', mark: '#E6DED0', img: 'assets/img/murier.jpg',
    ask: '톤이 칙칙하고 잡티가 신경 쓰여요',
    story:
      '실크로드의 오아시스 도시 사마르칸트, 오래된 길을 따라 하얀 뽕나무가 줄지어 서 있다. 천 년 넘게 이 나무의 잎은 누에를 길러 세상에서 가장 매끄러운 비단을 만들었다. 비단을 키워낸 나무의 뿌리로, ARCANA는 피부에 비단처럼 맑고 고른 결을 입힌다.',
  },
  {
    no: '02', fr: 'Églantine', ko: '로즈힙', concern: '탄력·주름', concernEn: 'Firmness',
    origin: '파타고니아, 칠레', sound: '톡', co: '바쿠치올',
    coNote: '식물에서 얻은 레티놀 대안. 밤사이 결을 단단하게 다진다.',
    petal: '#D9C7AE', accent: '#6A1F2B', line: '#D9C7AE', mark: '#6A1F2B', img: 'assets/img/eglantine.jpg',
    ask: '탄력이 예전 같지 않아요',
    story:
      '안데스산맥 아래 파타고니아의 거친 바람 속에서 야생 장미가 자란다. 꽃잎이 모두 지고 난 자리에 붉은 열매가 맺힌다. 로즈힙은 꽃이 진 뒤에야 비로소 완성되는 아름다움. 지는 것이 아니라 영그는 것, 그것이 우리가 말하는 에이징이다.',
  },
  {
    no: '03', fr: 'Fleur de Sureau', ko: '엘더플라워', concern: '진정', concernEn: 'Calm',
    origin: '스웨덴 서해안', sound: '사락', co: '블루 탄지',
    coNote: '푸른빛 오일을 품은 작은 들꽃. 붉어진 피부의 열을 가라앉힌다.',
    petal: '#B9BCBF', accent: '#7E8C72', line: '#B9BCBF', mark: '#9BA98E', img: 'assets/img/sureau.jpg',
    ask: '피부가 예민하고 쉽게 붉어져요',
    story:
      '스웨덴 서해안, 하지가 다가오면 엘더나무에 하얀 꽃송이가 구름처럼 피어난다. 북유럽 사람들은 이 꽃으로 차와 시럽을 만들어 일 년의 평온을 담아두었다. 가장 짧은 밤에 피어나는 이 작은 꽃으로, ARCANA는 예민해진 피부와 마음을 함께 가라앉힌다.',
  },
  {
    no: '04', fr: 'Trémelle', ko: '트레멜라', concern: '장벽', concernEn: 'Barrier',
    origin: '푸젠 산맥, 중국', sound: '똑', co: '씨 켈프',
    coNote: '차가운 바다의 미네랄을 머금은 해조. 수분이 빠져나가지 않도록 막을 친다.',
    petal: '#F4EFE6', accent: '#22332B', line: '#E4DCCB', mark: '#22332B', img: 'assets/img/tremelle.jpg',
    ask: '건조하고 세안 후 쉽게 당겨요',
    story:
      '푸젠의 안개 낀 산속, 비가 그친 고목 위에 반투명한 꽃 같은 버섯이 피어난다. 자기 무게의 수백 배에 달하는 물을 머금는 트레멜라. 물을 품고 놓지 않는 이 원료처럼, ARCANA는 피부가 스스로를 지키는 단단한 결을 만든다.',
  },
];

const CATEGORIES = [
  { key: 'lotion',   fr: 'Lotion',        ko: '스킨토너',   vessel: '시그니처 보틀 · 월넛 캡', vol: '150ml', finish: 'Clear', liquid: '#F3EEE4', glass: 'clear',
    measure: '코튼 한 장', how: '코튼에 넉넉히 적셔 결을 따라 사락사락 쓸어내리세요.', sound: '사락사락' },
  { key: 'emulsion', fr: 'Émulsion',      ko: '로션',       vessel: '시그니처 보틀 · 월넛 캡', vol: '100ml', finish: 'Frost', liquid: '#F1ECE2', glass: 'frost',
    measure: '펌프 두 번', how: '손바닥에 펼쳐 얼굴 안쪽에서 바깥으로 얇게 펴 바르세요.', sound: '스윽' },
  { key: 'elixir',   fr: 'Élixir',        ko: '세럼·에센스', vessel: '시그니처 보틀 · 월넛 캡', vol: '30ml', finish: 'Half frost', liquid: '#E8B9A2', glass: 'half',
    measure: '세 방울', how: '세 방울을 손바닥에 데워, 얼굴을 감싸듯 톡톡 눌러 스며들게 하세요.', sound: '톡톡' },
  { key: 'creme',    fr: 'Crème',         ko: '크림',       vessel: '시그니처 보틀 · 월넛 캡', vol: '50ml', finish: 'Opal', liquid: '#F6F3EC', glass: 'opal',
    measure: '콩 한 알', how: '손끝 온도로 녹인 뒤, 천천히 눌러 감싸 마무리하세요.', sound: '스르륵' },
  { key: 'brume',    fr: "Brume d'Huile", ko: '오일 미스트', vessel: '시그니처 보틀 · 월넛 캡', vol: '50ml', finish: 'Light', liquid: '#E7BE63', glass: 'light',
    measure: '두 번 칙—', how: '흔들어 두 층을 섞은 뒤, 얼굴에서 한 뼘 떨어져 뿌리세요.', sound: '칙' },
];

const LINES = {
  Matin: { ko: '모닝케어', role: '깨우고 지키는 항산화', time: '10–15분', scent: '만다린 · 베르가못',
    steps: ['lotion', 'elixir', 'emulsion'], greet: '좋은 아침이에요', stage: 'bud' },
  Midi:  { ko: '선케어', role: '한낮에 덧바르는 보호', time: '수시로', scent: '화이트 티 · 피그 리프',
    steps: ['brume'], greet: '한낮의 쉼표', stage: 'half' },
  Nuit:  { ko: '나이트케어', role: '풀고 회복하는 리추얼', time: '60분 · 샤워 리추얼 포함', scent: '이브닝 프림로즈 · 샌달우드',
    steps: ['lotion', 'elixir', 'creme'], greet: '오늘 밤, 당신의 피부에게', stage: 'bloom' },
};

const CONDITIONS = [
  { key: 'sleep',  label: '잠이 부족했어요',   note: '오늘은 단계를 줄여도 괜찮아요. 마지막 Élixir 세 방울만은 꼭.' },
  { key: 'stress', label: '스트레스가 많았어요', note: '시작 전, 향을 맡으며 숨을 세 번 고르세요. 서두를 이유가 없어요.' },
  { key: 'low',    label: '마음이 가라앉아요',  note: '의무가 아니라 의식이에요. 손바닥의 온기부터 천천히 느껴보세요.' },
  { key: 'fine',   label: '오늘은 괜찮아요',    note: '오늘의 평온을 Le Rituel에 기록해 두세요. 좋은 날도 처방이 됩니다.' },
];

/* 서랍의 역할 — 노션 7. 서랍의 역할 */
const ROLES = [
  { ko: '나눈다',       en: 'Divide',   meaning: '칸마다 하나씩 분류·정돈', arcana: '서랍 N°01–04 = 고민별·원료별 체계' },
  { ko: '꺼내준다',     en: 'Prescribe', meaning: '필요한 걸 찾아 건네줌',  arcana: '오늘의 상태에 맞는 솔루션을 꺼내는 처방' },
  { ko: '숨긴다',       en: 'Conceal',  meaning: '비밀을 품음, 아는 사람만 엶', arcana: 'ARCANA = 숨겨진 비법, 약제사의 비방' },
  { ko: '지킨다',       en: 'Preserve', meaning: '귀한 것을 빛·공기로부터 보존', arcana: '원료의 신선함, 시간을 멈추는 안티에이징' },
  { ko: '쌓는다',       en: 'Archive',  meaning: '하나씩 모여 기록이 됨', arcana: '표본 카드·처방전이 쌓여 나만의 약장' },
  { ko: '물려준다',     en: 'Heirloom', meaning: '엄마·할머니의 서랍처럼 대를 이음', arcana: '헤리티지, 오래 간직하는 패키지' },
  { ko: '발견하게 한다', en: 'Reveal',   meaning: '열기 전엔 모르는 설렘', arcana: '열어야 보이는 안쪽 컬러와 메시지' },
  { ko: '내 영역이 된다', en: 'Private', meaning: '남이 함부로 열지 않는 사적인 공간', arcana: '나만을 위한 시간, 조용한 럭셔리' },
];

