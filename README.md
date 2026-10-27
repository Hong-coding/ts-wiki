# TypeScript 마스터 위키

프로그래밍을 처음 배우는 사람이 TypeScript를 실무 수준까지 익히도록 만든 단계별 학습 위키입니다. [VitePress](https://vitepress.dev/) 기반이며 모든 문서는 `docs/` 아래 마크다운 파일입니다.

- 10개 파트 · 75개 레슨 · 부록 4개 · 실습 프로젝트 4개
- 레슨 목록의 단일 정의: [`docs/.vitepress/curriculum.mts`](docs/.vitepress/curriculum.mts) — 사이드바·목차·진도 체크리스트가 모두 이 파일에서 만들어집니다.
- 문서 작성 규칙: [`docs/guide/writing-guide.md`](docs/guide/writing-guide.md)

## 로컬에서 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5180 을 엽니다. 같은 네트워크의 다른 PC에서는 `http://<이 PC의 IP>:5180` 으로 접속합니다.

## 정적 빌드

```bash
npm run build
npm run preview
```

결과물은 `docs/.vitepress/dist`에 생깁니다. 존재하지 않는 페이지로 링크하면 빌드가 실패하므로, 문서를 고친 뒤에는 꼭 빌드해 봅니다.

## 서버에 상시 띄우기 (Docker)

```bash
docker compose up -d --build
```

http://서버주소:8090 으로 접속합니다. 문서를 고친 뒤에는 같은 명령으로 다시 빌드합니다.

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해 GitHub Pages에 배포합니다.

## 실습 프로젝트 예제 코드

`examples/projects/` 아래에 Part 8 프로젝트의 완성 코드가 있습니다. 각 폴더에서 `npm install` 후 실행합니다.

## 문서 추가·수정 방법

1. 새 레슨이면 `docs/.vitepress/curriculum.mts`에 항목을 추가합니다.
2. 해당 폴더에 `<slug>.md`를 만들고 [작성 규칙](docs/guide/writing-guide.md)의 뼈대를 따릅니다.
3. `npm run build`로 오류가 없는지 확인하고 커밋합니다.
