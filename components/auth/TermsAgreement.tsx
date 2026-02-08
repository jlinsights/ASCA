'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TermsAgreementProps {
  onAgree: (marketingConsent: boolean) => void
}

export function TermsAgreement({ onAgree }: TermsAgreementProps) {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  })

  const [allChecked, setAllChecked] = useState(false)

  // Update "All Checked" state when individual checkboxes change
  useEffect(() => {
    setAllChecked(agreements.terms && agreements.privacy && agreements.marketing)
  }, [agreements])

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked)
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked
    })
  }

  const handleSingleCheck = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }))
  }

  const canProceed = agreements.terms && agreements.privacy

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">약관동의</h2>
        <p className="text-muted-foreground">
          서비스 이용을 위해 필수 약관에 동의해 주세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* All Agreement */}
        <div className="bg-muted/30 p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="all-agree" 
              checked={allChecked}
              onCheckedChange={(c) => handleAllCheck(c as boolean)}
              className="w-6 h-6 border-celadon-green data-[state=checked]:bg-celadon-green"
            />
            <label
              htmlFor="all-agree"
              className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              사단법인 동양서예협회 이용약관, 개인정보 수집 및 이용, 마케팅 활용에 모두 동의합니다.
            </label>
          </div>
        </div>

        <Separator className="my-6" />

        {/* 1. Terms of Service (Mandatory) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              이용약관 동의 <span className="text-rose-500 text-sm ml-2">(필수)</span>
            </h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreements.terms}
                onCheckedChange={(c) => handleSingleCheck('terms', c as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">동의합니다</label>
            </div>
          </div>
          <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm text-muted-foreground bg-card">
            <p className="whitespace-pre-wrap leading-relaxed">
              제 1장 총칙<br/><br/>
              제 1조(목적)<br/>
              이 약관은 사단법인 동양서예협회(이하 "협회"라고 합니다.)이 운영하는 협회의 회원(이하 "회원"이라고 합니다.) 가입과 혜택 등(이하 "서비스"라고 합니다) 이용조건 및 절차에 관하여 협회와 회원 사이의 권리, 의무 및 책임사항의 규정을 목적으로 합니다.<br/><br/>
              제 2조 (약관의 명시 및 개정)<br/>
              1. 본 약관은 "협회"가 인터넷 홈페이지 화면 또는 지면에 게시하거나 기타의 방법으로 회원에게 공지하고 "회원"이 동의함으로써 효력이 발생합니다.<br/>
              2. "협회"는 필요에 따라 본 약관을 개정할 수 있으며, 회원 가입 후 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.<br/>
              3. 변경된 약관의 효력 발생일로부터 15일 이내에 "협회"에게 거부의 의사표시를 하지 않고 계속적으로 서비스를 이용하는 경우에는 변경 약관에 동의한 것으로 간주됩니다.<br/><br/>
              제 3조 (약관 외 준칙)<br/>
              본 약관에 명시되지 않은 사항과 본 약관에 대한 해석은 정부가 제정한 법령과 지침, 기준 등 관계 법령 또는 상관례에 따릅니다.<br/><br/>
              제 4조 (용어의 정의)<br/>
              1. "등록"이라 함은 고객이 "협회"의 "서비스"를 받고자 "협회"에 최초로 개인정보를 제공하고 본 약관에 동의하는 절차를 뜻합니다.<br/>
              2. "탈회"이라 함은 "회원"이 "협회"에 등록된 "개인정보"의 제공을 철회하고 더 이상 "서비스" 받는 것을 중단하는 행위를 뜻합니다.<br/>
              3. "회원등급"이라 함은 "협회"가 "서비스" 중 특화된 서비스를 제공하기 위하여 별도의 "회원" 동의를 받거나 자동적으로 "가입"되는 회원의 서비스 구분을 뜻합니다.<br/>
              4. "가입"이라 함은 "등록"된 "회원"이 특화된 "서비스"를 받기 위하여 특정 "회원등급"을 신청하는 행위를 뜻합니다.<br/>
              5. "해지"이라 함은 "등록"된 "회원"이 "가입"한 "회원등급"의 "서비스"를 철회하는 행위를 뜻합니다<br/>
              6. "만료"라 함은 "회원"이 "가입"한 "회원등급"의 유효일이 지나 더 이상 "서비스"를 받을 수 없는 것을 뜻합니다.<br/>
              7. "개인정보 삭제"라 함은 "회원"의 요구 또는 "협회"가 법령과 기준에 따라 개인정보를 삭제하는 행위로서, "탈회"와 같은 효력이 발생됩니다.<br/>
              8. "홈페이지"라 함은 협회 대표 홈페이지를 뜻합니다.<br/><br/>
              제 5조 (등록신청 및 이용계약의 성립)<br/>
              1. "서비스" 이용을 원하는 고객은 "협회"가 지정한 소정양식의 가입신청서를 작성하여 온라인 또는 기타 협회가 지정하는 방법으로 요구하는 사항을 기록하여 "등록"을 신청합니다.<br/>
              2. "등록"에 따른 "서비스" 이용계약은 고객의 약관 동의, 등록신청, "협회"의 승인에 의하여 성립됩니다.<br/>
              3. "협회"는 본인의 실명으로 신청하지 않거나 사회의 안녕과 질서 혹은 미풍양속을 저해할 목적으로 신청하는 경우 등록을 거부할 수 있습니다.<br/><br/>
              제 6조 (회원의 기본 회원등급 가입)<br/>
              고객은 "협회"의 "회원"으로 "등록"하는 경우 기본적으로 무료 "일반회원" 자격을 부여받습니다.<br/><br/>
              제 7조 (만14세 미만의 회원 등록 및 가입)<br/>
              "협회"는 만14세 미만이 "회원" "등록"을 할 경우 법정대리인의 동의를 얻어야 합니다.<br/><br/>
              제 8조 (회원탈회 및 자격상실)<br/>
              1. "회원"은 언제든지 "탈회"를 요청할 수 있으며, "협회"는 즉시 "탈회"를 처리합니다.<br/>
              2. "회원"이 다음 각 호의 사유에 해당하는 경우 "협회"는 "회원" 자격을 제한 또는 정지시킬 수 있습니다.<br/>
              - "등록" 신청 시 허위 내용을 등록한 경우<br/>
              - 범죄 행위와 관련된 경우<br/>
              - 다른 사람의 아이디와 비밀번호를 도용한 경우<br/>
              - 공공질서 및 미풍양속에 저해되는 내용을 유포시킨 경우<br/><br/>
              제 9조 (전당의 의무)<br/>
              "협회"는 법령과 본 약관이 금지하거나 공공질서에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하는 데 최선을 다합니다.<br/><br/>
              제 10조 (회원의 의무)<br/>
              "회원"은 관계법령, 본 약관의 규정, 이용안내 등 "협회"가 통지하는 사항을 준수하여야 합니다.<br/><br/>
              제 11조 (개인정보보호)<br/>
              "협회"는 "회원"의 개인정보(신용정보 포함) 보안에 대하여 최고의 안전 조치를 강구하여 "회원"의 정보보안에 최선을 다해야 할 의무가 있습니다.<br/><br/>
              제 12조 (관할 법원)<br/>
              본 "서비스"와 관련된 분쟁에 대해 "협회"를 피고로 하는 소송이 제기될 경우, 협회의 주사무소 소재지를 관할하는 법원을 전속관할 법원으로 합니다.<br/><br/>
              부칙<br/>
              제 13조 (기본 제공 서비스)<br/>
              1. "회원"은 "협회"가 제공하는 검색서비스, 커뮤니티 이용, VOD 서비스, 게시판 이용이 가능합니다.<br/>
              2. "협회"는 공연 및 전시 정보를 정기적·부정기적으로 수신동의자에 한하여 휴대폰 문자서비스(이하 "문자"라 합니다.)로 제공합니다.<br/>
              3. "회원"은 홈페이지 이벤트 참여기회를 얻습니다. 단, 참여 조건과 참여횟수는 협회가 홈페이지에 표시한 기준에 따라 제한될 수 있습니다.<br/><br/>
              제 2장 회원등급별 서비스<br/><br/>
              제 14조 (회원등급, 연회비, 유효기간, 가입)<br/>
              "협회"의 "회원등급" 등의 운영 정책은 별도 규정에 따릅니다.<br/><br/>
              제 15조 (회원카드의 발행)<br/>
              "협회"는 필요 시 회원카드를 발행할 수 있으며, 구체적인 발행 기준은 내부 규정에 따릅니다.<br/><br/>
              제 16조 (회원 서비스의 종류)<br/>
              "협회"가 제공하는 "회원"의 서비스는 다음 각 호와 같으며, 상세 내용은 홈페이지를 통해 공지합니다.<br/>
              1. 강좌 수강 시 수강료 할인 (할인율은 강좌별 상이할 수 있음)<br/>
              2. 협회가 주최하는 전시 및 행사 초청 또는 할인<br/>
              3. 기타 협회가 정하는 회원 혜택<br/><br/>
              제 17조 (환불규정)<br/>
              1. "유료회원"은 "탈회" 또는 "회원등급" 조정을 요청하는 경우 내부 규정에 따라 "가입"시 지급한 연회비를 환불 받을 수 있습니다.<br/>
              2. 강좌 수강료 환불은 평생교육법 등 관련 법령 및 협회 내부 규정에 따릅니다.<br/><br/>
              제 18조 (입장권구매에 대한 취소,환불규정)<br/>
              전시 및 행사 입장권의 취소 및 환불은 공정거래위원회 소비자분쟁해결기준을 준수합니다.<br/><br/>
              제 3장 개인정보보호<br/><br/>
              제 19조 (협회의 기본의무)<br/>
              1. "협회"는 "회원" "등록" 또는 "가입"시 "서비스" 제공에 필요한 최소한의 정보를 수집합니다.<br/>
              2. "협회"는 "회원"이 "서비스"를 안전하게 이용할 수 있도록 "회원"의 개인정보(신용정보 포함) 보안에 대하여 최고의 안전 조치를 강구하여 "회원"의 정보보안에 최선을 다해야 할 의무가 있습니다.<br/><br/>
              제 20조 (개인정보의 수집)<br/>
              1. "협회"는 다음 각 호의 개인정보를 "회원"으로부터 수집합니다.<br/>
              - 성명, 생년월일, 이메일주소, 아이디, 비밀번호, 연락처 (필수항목)<br/>
              - 주소, 성별 (선택항목)<br/>
              2. 고객은 필수항목을 제공함으로써 "회원"으로서의 자격을 부여받습니다. 고객은 해당 항목에 대한 제공을 거부할 수 있으며 이 경우 "회원"으로서의 자격을 부여받을 수 없습니다.<br/><br/>
              제 21조 (개인정보의 활용)<br/>
              1. "협회"는 수집된 개인정보에 대하여 다음 각 호와 같이 활용할 수 있습니다.<br/>
              - 서비스 제공 및 본인 확인<br/>
              - 회원 관리 및 공지사항 전달<br/>
              - 마케팅 및 광고 (동의자에 한함)<br/>
              2. "협회"는 수집된 개인정보에 대하여 별도의 동의를 받지 아니하고서는 제3자에게 제공하지 않습니다. 단, 법령에 특별한 규정이 있는 경우 등은 예외로 합니다.<br/><br/>
              제 22조 (개인정보의 취급)<br/>
              기타 개인정보의 관리, 파기, 열람청구, 정정청구 등에 관련된 제반 사항은 관련 법령 및 "협회"의 개인정보처리방침에 따릅니다.<br/><br/>
              제 4장 기타<br/><br/>
              제 23조 (손해배상 및 면책)<br/>
              1. "협회"는 "협회"의 고의 또는 과실로 발생하는 "회원"의 손해에 대하여 책임을 집니다.<br/>
              2. "협회"는 천재지변 등 불가항력적 사유, "회원"의 귀책사유로 인한 서비스 이용 장애 등에 대해서는 책임을 지지 않습니다.<br/><br/>
              제 24조 (관할 법원)<br/>
              본 "서비스"와 관련된 분쟁에 대해 "협회"를 피고로 하는 소송이 제기될 경우, 협회의 주사무소 소재지를 관할하는 법원을 전속관할 법원으로 합니다.<br/><br/>
              부칙<br/>
              본 약관은 2026년 1월 11일부터 시행합니다.
            </p>
          </ScrollArea>
        </div>

        {/* 2. Privacy Policy (Mandatory) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              개인정보 수집 및 이용 동의 <span className="text-rose-500 text-sm ml-2">(필수)</span>
            </h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="privacy" 
                checked={agreements.privacy}
                onCheckedChange={(c) => handleSingleCheck('privacy', c as boolean)}
              />
              <label htmlFor="privacy" className="text-sm cursor-pointer">동의합니다</label>
            </div>
          </div>
          <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm text-muted-foreground bg-card">
            <div className="space-y-4">
              <p className="leading-relaxed">
                사단법인 동양서예협회는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같이 개인정보를 수집하고 있습니다.
              </p>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 font-medium">수집항목</th>
                    <th className="py-2 font-medium">수집목적</th>
                    <th className="py-2 font-medium">보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-2">성명, 생년월일, 성별, 아이디, 비밀번호, 주소, 연락처, 이메일</td>
                    <td className="py-2 pr-2">티켓 구매 및 회원서비스 제공</td>
                    <td className="py-2">5년(구매이력 있음) / 1년(단순가입)</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                ※ 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부할 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>
          </ScrollArea>
        </div>

        {/* 3. Marketing Consent (Optional) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              마케팅 활용에 관한 동의 <span className="text-muted-foreground text-sm ml-2 font-normal">(선택)</span>
            </h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing" 
                checked={agreements.marketing}
                onCheckedChange={(c) => handleSingleCheck('marketing', c as boolean)}
              />
              <label htmlFor="marketing" className="text-sm cursor-pointer">동의합니다</label>
            </div>
          </div>
          <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm text-muted-foreground bg-card">
            <div className="space-y-4">
              <p className="leading-relaxed">
                사단법인 동양서예협회에서 제공하는 신규 강좌, 전시 소식, 이벤트 등 유용한 정보를 받아보시겠습니까?
              </p>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 font-medium">목적</th>
                    <th className="py-2 font-medium">항목</th>
                    <th className="py-2 font-medium">보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-2">공연정보 추천서비스, 뉴스레터, 이벤트, 할인안내 정보 발송 안내</td>
                    <td className="py-2 pr-2">연락처(휴대폰번호), 이메일, SMS수신여부</td>
                    <td className="py-2">5년(구매이력 있음) / 1년(단순가입)</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                ※ 마케팅 활용 동의는 선택 사항이며, 동의하지 않아도 기본 서비스 이용에 제한은 없습니다.
              </p>
            </div>
          </ScrollArea>
        </div>
      </div>

      <Button 
        className={cn(
          "w-full py-6 text-lg transition-all duration-300",
          canProceed ? "bg-celadon-green hover:bg-celadon-green/90" : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
        disabled={!canProceed}
        onClick={() => onAgree(agreements.marketing)}
      >
        다음 단계로 이동
      </Button>
    </div>
  )
}
