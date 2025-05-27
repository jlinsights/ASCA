export function BrandColors() {
  return (
    <section className="brand-section" id="color-palette">
      <h2 className="brand-section-title">컬러 팔레트</h2>
      <p className="mb-8 text-base">
        Galleria의 컬러 팔레트는 동아시아 예술의 전통적 재료와 자연에서 영감을 받았습니다. 깊은 먹색부터 종이의
        따스함까지, 각 색상은 예술의 역사와 정신을 담고 있습니다.
      </p>

      <h3 className="brand-section-subtitle">주요 컬러</h3>
      <div className="color-palette">
        <div className="color-swatch bg-ink-black text-rice-paper">
          Traditional Ink Black
          <br />
          #1a1a1a
          <div className="color-info">
            먹의 깊이와 전통의 권위를 상징하는 주요 색상, 라이트 모드에서 텍스트, 다크 모드에서 배경색으로 사용
          </div>
        </div>
        <div className="color-swatch bg-rice-paper text-ink-black border border-gray-200">
          Rice Paper White
          <br />
          #f5f5f0
          <div className="color-info">
            한지의 따스한 질감과 순수함을 담은 색상, 라이트 모드에서 배경색, 다크 모드에서 텍스트 색상으로 사용
          </div>
        </div>
        <div className="color-swatch bg-celadon-green text-ink-black">
          Celadon Green
          <br />
          #88A891
          <div className="color-info">동아시아 청자의 고요함과 지혜를 표현하는 포인트 컬러</div>
        </div>
        <div className="color-swatch bg-scholar-red text-rice-paper">
          Scholar Red
          <br />
          #af2626
          <div className="color-info">동아시아 학자들이 사용한 주묵의 강렬한 붉은색</div>
        </div>
      </div>

      <div className="usage-container mt-12">
        <div className="usage-title">컬러 사용 가이드라인</div>
        <div className="usage-grid">
          <div className="usage-item">
            <h3>주요 컬러 활용</h3>
            <ul className="usage-list">
              <li>
                <strong>Traditional Ink Black:</strong> 라이트 모드에서 텍스트, 다크 모드에서 배경색으로 활용
              </li>
              <li>
                <strong>Rice Paper White:</strong> 라이트 모드에서 배경색, 다크 모드에서 텍스트 색상으로 사용
              </li>
              <li>
                <strong>Celadon Green:</strong> 버튼, 하이라이트, 인터랙티브 요소에 적용하여 사용자 행동 유도
              </li>
              <li>
                <strong>Scholar Red:</strong> 중요 알림, 경고, 특별한 강조가 필요한 요소에 사용
              </li>
            </ul>
          </div>
          <div className="usage-item">
            <h3>컬러 조합 원칙</h3>
            <ul className="usage-list">
              <li>
                <strong>대비와 가독성:</strong> 텍스트와 배경 간 충분한 대비로 WCAG 2.1 AA 기준 준수
              </li>
              <li>
                <strong>조화로운 조합:</strong> 최대 3개의 주요 컬러를 한 화면에서 조화롭게 사용
              </li>
              <li>
                <strong>의미적 일관성:</strong> 동일한 기능과 상태는 항상 같은 색상으로 표현
              </li>
              <li>
                <strong>문화적 맥락:</strong> 동아시아 예술의 색채 미학을 고려한 색상 활용
              </li>
            </ul>
          </div>
          <div className="usage-item">
            <h3>다크 모드 적용</h3>
            <ul className="usage-list">
              <li>
                <strong>색상 반전:</strong> 라이트 모드와 다크 모드에서 배경과 텍스트 색상 반전
              </li>
              <li>
                <strong>색상 조정:</strong> 다크 모드에서 더 좋은 가독성을 위해 색상 밝기 조정
              </li>
              <li>
                <strong>일관된 브랜드 경험:</strong> 모드 전환에도 브랜드 아이덴티티 유지
              </li>
              <li>
                <strong>접근성 고려:</strong> 모든 모드에서 텍스트 가독성 보장
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
