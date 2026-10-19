// CI 의 `tsc --noEmit` 은 next-env.d.ts(빌드 때 생성, gitignore)를 보지 못한다.
// regulation-figures.ts 의 .png 정적 import 타입을 여기서 직접 끌어온다.
/// <reference types="next/image-types/global" />
