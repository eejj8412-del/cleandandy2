# 가구 복원 전문페이지

furniture-repair 폴더 전체를 GitHub 최상단에 업로드합니다.
공통 스타일은 기존 floor-repair/style.css를 사용합니다.
공개 예정 주소: https://allhousefix.co.kr/furniture-repair/
사진 3장 포함, 영상 없음.

메인 index.html의 ‘고가구 복원’ 카드를 아래로 교체하세요.

```html
<article style="position:relative; cursor:pointer;">
  <span class="service-icon">♜</span>
  <h3>가구 복원</h3>
  <a href="/furniture-repair/" aria-label="가구 복원 페이지 보기" style="position:absolute; inset:0; z-index:10;"></a>
</article>
```

