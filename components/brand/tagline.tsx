export function Tagline() {
  return (
    <section className="brand-section" id="tagline">
      <h2 className="brand-section-title">태그라인</h2>
      <div className="usage-container">
        <div className="logo-container bg-ink-black">
          <div className="text-rice-paper text-center">
            <h3 className="text-2xl mb-2">GALLERIA</h3>
            <p className="text-sm">Art Gallery & Exhibition</p>
          </div>
        </div>
        <div className="usage-title">"Where Art Transcends Boundaries"</div>
        <p className="mb-8 text-base">
          이 태그라인은 Galleria의 핵심 철학을 담고 있습니다. 예술이 물리적, 문화적, 정신적 경계를 초월하여 관람객에게
          새로운 경험을 제공한다는 메시지를 담고 있습니다. 예술을 통해 서로 다른 세계와 관점을 연결하는 다리 역할을 하는
          Galleria의 비전을 표현합니다.
        </p>
        <div className="usage-grid">
          <div className="usage-item">
            <h3>공식 문서 활용</h3>
            <ul className="usage-list">
              <li>
                <strong>레터헤드:</strong> 공문서 상단 로고 하단에 정렬하여 배치
              </li>
              <li>
                <strong>명함:</strong> 로고와 함께 명함 전면 하단 또는 후면 중앙에 배치
              </li>
              <li>
                <strong>이메일 서명:</strong> 로고 아래 작은 크기로 일관되게 사용
              </li>
              <li>
                <strong>프레스 릴리스:</strong> 첫 페이지 헤더 영역에 반드시 포함
              </li>
            </ul>
          </div>
          <div className="usage-item">
            <h3>디지털 미디어 적용</h3>
            <ul className="usage-list">
              <li>
                <strong>웹사이트 헤더:</strong> 랜딩 페이지 히어로 섹션에 강조하여 표시
              </li>
              <li>
                <strong>소셜 미디어:</strong> 프로필 소개와 주요 캠페인 이미지에 통합
              </li>
              <li>
                <strong>디지털 광고:</strong> 브랜드 메시지의 마무리로 활용
              </li>
              <li>
                <strong>프레젠테이션:</strong> 타이틀 슬라이드와 엔딩 슬라이드에 포함
              </li>
            </ul>
          </div>
          <div className="usage-item">
            <h3>디자인 가이드라인</h3>
            <ul className="usage-list">
              <li>
                <strong>여백 규정:</strong> 로고와 최소 20px(또는 로고 높이의 1/3) 간격 유지
              </li>
              <li>
                <strong>비율:</strong> 텍스트 크기는 로고의 1/3 이하로 설정
              </li>
              <li>
                <strong>서체:</strong> Inter 또는 Montserrat 산세리프체 사용
              </li>
              <li>
                <strong>컬러:</strong> 로고와 동일한 색상 사용, 배경에 따라 흰색/검정 전환
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
