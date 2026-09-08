# 방문 필름 시공 전문페이지

GitHub 저장소 최상단에 영문 이름의 `interior-film-installation` 폴더 전체를 업로드합니다.

- 공개 주소: `https://allhousefix.co.kr/interior-film-installation/`
- 메인 키워드: 방문 필름 시공
- 보조 키워드: 인테리어 필름 시공, 방문 필름 한 면 시공, 셀프 필름 제거, 방문 파손 보수
- 실제 사례: 서울시 광진구 광장힐스테이트
- 사진 3개와 시공 전·후 영상 2개 포함

업로드 후 메인 홈페이지의 기존 `필름 시공` 카드를 `/interior-film-installation/`로 연결합니다.

## 메인 홈페이지 카드 연결 코드

```html
<article style="position:relative; cursor:pointer;">
  <span class="service-icon">◩</span>
  <h3>필름 시공</h3>
  <a
    href="/interior-film-installation/"
    aria-label="방문 필름 시공 페이지 보기"
    style="position:absolute; inset:0; z-index:10;"
  ></a>
</article>
```
