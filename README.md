# ARCANA — From Essence to Ritual

감각의 약장(The Sensory Apothecary) 브랜드 쇼케이스 웹사이트. 빌드 없이 돌아가는 정적 사이트 (HTML · CSS · JS).

## 구조
```
index.html        페이지 마크업 (섹션 순서)
css/style.css     컬러 토큰 · 시간대 톤(Matin/Midi/Nuit) · 모든 스타일
js/data.js        브랜드 데이터 — 서랍 4 · 제형 5 · 시간대 라인 · 컨디션 · 서랍의 역할
js/main.js        인터랙션 (약장, 서랍 패널, Consultation 02–06)
assets/img/       키노트에서 가져온 이미지
```

## 인터랙션 (키노트 INTERACTION · WEB DETAIL 기준)
| 트리거 | 동작 | 위치 |
|---|---|---|
| HOVER | 서랍이 살짝 빠지며 틈으로 실버빛 | 히어로 미니 약장, 4×5 약장, 메뉴 |
| PULL | 스크롤·드래그·버튼으로 무겁게 당겨지고 끝에서 멈칫 | Consultation 03–04 |
| BLOOM | 꽃잎 4장이 하나씩 열림 (서랍 4개) | Consultation 05 |
| TAKE | 탑뷰 트레이에서 제품을 드래그해 담기 | Consultation 05 |
| SEAL | 이름이 찍힌 Ordonnance에 실버 실링 | Consultation 06 |
| TIME | 접속 시간에 따라 Matin · Midi · Nuit 톤 (상단에서 직접 전환 가능) | 전체 |
| NAV | 메뉴 자체가 약장: N°01–04 · Le Tiroir · Le Rituel · L'Herbier | 상단 |

약장(L'Apothicaire)은 **Shop by Drawer**(가로 줄 = 서랍 하나의 5단계 라인)와 **Shop by Category**(세로 줄 = 같은 제형의 4개 서랍 버전) 두 기준으로 열림.

## 내용 수정
- 문구·원료·제품 정보: `js/data.js`만 고치면 전체 반영
- 컬러: `css/style.css` 맨 위 `:root` 토큰 (`--wood` 서랍 앞면, `--inside` 서랍 속 등)
- 서랍별 꽃잎 컬러: `data.js`의 `petal`, `accent`
- 워드마크 폰트: 지금은 Cormorant Garamond로 대체 → 확정한 3번 폰트로 바꾸려면 `--serif` 수정 (웹폰트 파일이면 `assets/fonts/`에 넣고 `@font-face` 추가)

## GitHub Pages 배포
1. GitHub에서 새 저장소 만들기 (예: `arcana`)
2. 이 폴더 안의 파일 전체를 업로드 (Add file → Upload files) 또는
   ```bash
   git init && git add . && git commit -m "ARCANA website"
   git branch -M main
   git remote add origin https://github.com/<아이디>/arcana.git
   git push -u origin main
   ```
3. Settings → Pages → Source: **Deploy from a branch**, Branch: `main` / `(root)` → Save
4. 1–2분 뒤 `https://<아이디>.github.io/arcana/` 에서 확인

로컬 미리보기: `index.html`을 브라우저로 바로 열면 됨.
