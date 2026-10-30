'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { AboutChapter } from '@/components/about/about-layout'

const koreanGreeting = `존경하는 사단법인 동양서예협회 회원 여러분, 그리고 묵향을 사랑하시는 모든 작가 여러분,

깊어 가는 가을, 한 해의 결실을 거두는 이 계절에 협회가 오랫동안 준비해 온 소식을 전해 드리게 되어 기쁜 마음으로 인사를 올립니다.

제23회 대한민국 동양서예대전은 2027년 4월 21일부터 30일까지 예술의전당 서울서예박물관에서 열립니다. 이번 대전은 협회 역사에서 뜻깊은 전환점입니다. 서울서예박물관 제1전시실과 제2전시실을 모두 대관하여, 하나의 대전 안에 공모전과 '書境(서경)' 초대작가전·개인전·부스전을 함께 펼치게 되었기 때문입니다.

제2전시실에서는 공모전이 열려 새로운 작가를 발굴하는 무대가 되고, 제1전시실에서는 '서경' 초대작가전과 개인전, 단체 부스전이 어우러져 동양서예의 현재와 미래를 한자리에서 보여 드립니다. 신진 작가의 첫 출품작과 원로·중진 작가의 원숙한 필묵이 같은 기간, 같은 공간에서 마주하는 것, 이것이 이번 대전이 지향하는 '새로운 지평'입니다.

이번 대전을 준비하며 무엇보다 공을 들인 것은 문을 넓히는 일이었습니다.

먼저 청년작가의 참여 기회를 넓혔습니다. 대학 서예 전공자와 전국대학서예연합 소속·출신 청년작가의 출품을 적극 권장하고, 청년부에는 별도의 심사 기준을 두어 젊은 작가들이 자신의 목소리로 평가받을 수 있도록 하였습니다. 서예의 내일은 오늘 붓을 잡는 젊은 손에 달려 있다고 믿기 때문입니다.

다음으로 외부 작가에게도 초대작가전의 문을 열었습니다. 이번 회차에 신설한 특별규정에 따라, 협회 정회원이 아니더라도 실력을 갖춘 작가라면 '서경' 초대작가전에 참여할 수 있습니다. 추천·초대작가 선임 규정의 특별선임 절차도 함께 마련하였습니다. 역량 있는 작가들이 소속을 넘어 한자리에 모일 때 협회의 예술적 스펙트럼은 더욱 넓고 깊어질 것입니다.

아울러 개인전과 소규모 단체의 부스전을 대전 안에 품어, 작가 개인의 세계와 단체의 연구 성과를 품격 있는 공간에서 선보일 수 있게 하였습니다. 출품 접수부터 심사, 전시와 시상에 이르는 모든 과정은 새로 정비한 운영 및 심사 규정에 따라 투명하고 공정하게 진행하겠습니다.

출품 접수는 2027년 1월 31일에 마감합니다. 자세한 내용은 협회 홈페이지의 공모요강과 출품원서에서 확인하실 수 있습니다. 회원 여러분은 물론, 서예·문인화·전각을 수련하는 모든 분의 많은 관심과 참여를 부탁드립니다.

이와 함께 협회 홈페이지를 대대적으로 새롭게 단장하였습니다. 무엇보다 한국어뿐 아니라 영어, 일본어, 중국어로 언제든 전환해 보실 수 있도록 다국어 환경을 갖추었습니다. 우리 협회가 오랜 세월 이어 온 한·중·일 서예 교류의 역사를 온라인에서도 이어 가며, 국경을 넘어 더 많은 작가와 애호가가 협회의 활동을 함께 나눌 수 있도록 하겠습니다.

새 홈페이지는 협회 커뮤니티를 활성화하는 터전이 될 것입니다. 작가 소개와 작품 아카이브, 온라인 출품과 같은 다양한 기술을 적용하여 작가 한 분 한 분의 온라인 활동(Online Presence)을 넓히고, 이를 뒷받침하는 정책 지원을 꾸준히 개발해 나가겠습니다. 전시장에서 맺은 인연이 온라인에서도 이어져, 작가와 관람객, 작가와 작가가 더 가까이 만나는 협회를 만들어 가겠습니다.

협회는 法古創新, 옛 법을 익혀 새로움을 열고 人書俱老, 글씨와 사람이 함께 깊어지는 길을 걸어왔습니다. 이 정신을 지키되, 더 많은 작가에게 열린 무대를 마련하는 일에 협회가 앞장서겠습니다. 내년 봄, 예술의전당에서 여러분을 반갑게 맞이하겠습니다.

회원 여러분의 가정에 늘 평안과 건강이 함께하시기를 진심으로 기원합니다.

2026년 10월 30일

사단법인 동양서예협회 이사장 임재홍`

const englishGreeting = `Dear Members of the Asian Society of Calligraphic Arts (ASCA), and all artists who love the fragrance of ink,

As autumn deepens and the year's work comes to fruition, I am delighted to share news that our association has long been preparing.

The 23rd Korea Oriental Calligraphy Exhibition will be held from April 21 to 30, 2027, at the Seoul Calligraphy Museum in the Seoul Arts Center. This exhibition marks a meaningful turning point in our history: we have reserved both Gallery 1 and Gallery 2 of the museum, bringing the open competition and the "Seogyeong (書境)" exhibition of invited artists, solo shows and booth exhibitions together under one roof.

Gallery 2 will host the open competition, a stage for discovering new artists. Gallery 1 will bring together the Seogyeong invited artists' exhibition, solo shows and group booth exhibitions, presenting the present and future of Oriental calligraphy in one place. A newcomer's first entry and the mature brushwork of senior artists, facing each other in the same space at the same time: this is the "new horizon" this exhibition aims for.

Above all, our preparations have focused on opening the doors wider.

First, we have expanded opportunities for young artists. We warmly encourage entries from university calligraphy majors and from current and former members of the National University Calligraphy Association, and the youth division will be judged by its own criteria so that young artists are evaluated in their own voice. We believe the future of calligraphy rests in the young hands that take up the brush today.

Second, we have opened the invited artists' exhibition to artists from outside the association. Under a special provision introduced for this edition, accomplished artists may take part in the Seogyeong invited artists' exhibition even if they are not full members of ASCA, and a special appointment procedure for recommended and invited artists has been prepared as well. When capable artists gather beyond their affiliations, the artistic range of our association grows wider and deeper.

We have also made room within the exhibition for solo shows and booth exhibitions by small groups, so that individual artistic worlds and the research of each group can be shown in a dignified space. Every step, from entry and judging to exhibition and awards, will be conducted transparently and fairly under our newly revised operating and judging regulations.

Entries close on January 31, 2027. Full details are available in the competition guidelines and entry form on our website. We warmly invite not only our members but everyone who practices calligraphy, literati painting or seal carving to take part.

We have also carried out a major renovation of the association's website. Above all, it now offers a multilingual environment: visitors can switch at any time between Korean, English, Japanese and Chinese. Through it we will carry the long history of calligraphic exchange among Korea, China and Japan into the online world, so that more artists and admirers across borders can share in the association's activities.

The new website will be a home for our community. By applying a range of technologies, such as artist profiles, artwork archives and online entry, we will expand the online presence of each of our artists, and we will continue to develop policies that support it. We hope the connections made in the exhibition hall will carry on online, bringing artists and visitors, and artists and one another, closer together.

Our association has walked the path of 法古創新, learning the old methods to open the new, and 人書俱老, where calligraphy and the person deepen together. Keeping to this spirit, we will lead the way in building an open stage for more artists. We look forward to welcoming you at the Seoul Arts Center next spring.

I sincerely wish peace and good health to all our members and their families.

October 30, 2026

Lim Jae-hong, Chairman of the Asian Society of Calligraphic Arts (ASCA)`

const japaneseGreeting = `敬愛する社団法人東洋書芸協会会員の皆様、そして墨の香りを愛するすべての作家の皆様

秋も深まり、一年の実りを収めるこの季節に、当協会が長く準備してまいりました知らせをお届けできることを、心より嬉しく思います。

第23回 大韓民国 東洋書芸大展は、2027年4月21日から30日まで、ソウル芸術の殿堂 書芸博物館で開催されます。今回の大展は、協会の歴史において意義深い転換点となります。書芸博物館の第1展示室と第2展示室をともに借り切り、一つの大展の中で公募展と「書境(ソギョン)」招待作家展・個展・ブース展を同時に繰り広げることになったからです。

第2展示室では公募展が開かれ、新たな作家を発掘する舞台となります。第1展示室では「書境」招待作家展と個展、団体のブース展が調和し、東洋書芸の現在と未来を一堂にご覧いただけます。新進作家の初出品作と、長老・中堅作家の円熟した筆墨が、同じ会期、同じ空間で向き合うこと――これこそが今回の大展が目指す「新たな地平」です。

今回の大展の準備にあたり、何よりも力を注いだのは、門戸を広げることでした。

まず、青年作家の参加の機会を広げました。大学で書芸を専攻する方々や、全国大学書芸連合に所属する、あるいは出身の青年作家の出品を積極的に奨励し、青年部には別途の審査基準を設けて、若い作家が自らの声で評価を受けられるようにしました。書芸の明日は、今日筆を執る若い手にかかっていると信じるからです。

次に、協会外の作家にも招待作家展の門を開きました。今回新設した特別規定により、協会の正会員でなくとも実力ある作家であれば、「書境」招待作家展に参加することができます。推薦・招待作家選任規定に基づく特別選任の手続きもあわせて整えました。力量ある作家が所属を越えて一堂に会するとき、協会の芸術的な広がりはいっそう豊かで深いものとなるでしょう。

あわせて、個展と小規模団体のブース展を大展の中に迎え入れ、作家一人ひとりの世界と団体の研究成果を、品格ある空間で披露できるようにしました。出品の受付から審査、展示、授賞に至るすべての過程は、新たに整備した運営および審査規定に従い、透明かつ公正に進めてまいります。

出品の受付は2027年1月31日に締め切ります。詳しくは、協会ホームページの公募要綱と出品申込書でご確認いただけます。会員の皆様はもとより、書芸・文人画・篆刻を修める皆様の多大なるご関心とご参加をお願い申し上げます。

これとともに、協会のホームページを全面的に刷新いたしました。何よりも、韓国語だけでなく英語・日本語・中国語へいつでも切り替えてご覧いただける多言語環境を整えました。当協会が長年にわたり続けてきた日韓中の書芸交流の歴史をオンラインでも受け継ぎ、国境を越えてより多くの作家と愛好家の皆様が協会の活動を分かち合えるようにしてまいります。

新しいホームページは、協会コミュニティを活性化する拠点となるでしょう。作家紹介や作品アーカイブ、オンライン出品など、さまざまな技術を取り入れて作家一人ひとりのオンライン上での活動(Online Presence)を広げ、それを支える政策支援を継続して開発してまいります。展示会場で結ばれたご縁がオンラインでも続き、作家と観覧者、作家と作家がより身近に出会える協会を築いてまいります。

協会は、法古創新――古法に学び新しきを拓き、人書俱老――書と人がともに深まる道を歩んでまいりました。この精神を守りつつ、より多くの作家に開かれた舞台を設けることに、協会が先頭に立って取り組んでまいります。来春、芸術の殿堂にて皆様にお目にかかれることを心より楽しみにしております。

会員の皆様のご家庭に、常に平安と健康がありますよう心よりお祈り申し上げます。

2026年10月30日

社団法人東洋書芸協会 理事長 林宰弘`

const chineseGreeting = `敬愛的社團法人東洋書藝協會會員們，以及所有熱愛墨香的書藝家們：

時值深秋，正是收穫一年成果的季節，本會能在此時向各位傳達籌備已久的消息，深感欣喜，謹致問候。

第23屆大韓民國東洋書藝大展將於2027年4月21日至30日，在首爾藝術殿堂書藝博物館隆重舉行。本屆大展是本會歷史上意義深遠的轉折點：我們同時租用了書藝博物館第1展覽室與第2展覽室，得以在同一大展之中，一併呈現公募展以及「書境」邀請作家展、個展與攤位展。

第2展覽室舉辦公募展，成為發掘新秀的舞台；第1展覽室則匯集「書境」邀請作家展、個展與團體攤位展，於一處呈現東洋書藝的現在與未來。新進作家的首次參展之作，與資深、中堅作家圓熟的筆墨，在同一展期、同一空間中相遇——這正是本屆大展所追求的「新的地平線」。

籌備本屆大展時，我們最用心的，是把門開得更寬。

首先，我們擴大了青年作家的參與機會。積極鼓勵大學書藝主修生，以及全國大學書藝聯合會現任與歷屆成員的青年作家參展，並為青年組另訂審查標準，讓年輕作家能以自己的聲音接受評價。因為我們相信，書藝的明天，掌握在今天執筆的年輕雙手之中。

其次，我們也向會外作家敞開了邀請作家展的大門。依據本屆新設的特別規定，即使並非本會正會員，只要具備實力，皆可參加「書境」邀請作家展；同時亦依推薦・邀請作家選任規定，備妥特別選任程序。當有實力的作家跨越所屬、齊聚一堂，本會的藝術視野必將更加寬廣而深厚。

此外，我們將個展與小型團體的攤位展納入大展之中，讓每位作家的藝術世界與各團體的研究成果，都能在高雅的空間中展現。從受理參展、審查，到展覽與頒獎的所有過程，都將依照新修訂的營運及審查規定，以透明、公正的方式進行。

參展受理將於2027年1月31日截止。詳細內容請參閱本會網站的公募簡章與參展申請書。誠摯邀請各位會員，以及所有研習書藝、文人畫與篆刻的朋友踴躍關注與參與。

與此同時，本會網站也已全面改版。最重要的是，我們建置了多語言環境，除韓文外，亦可隨時切換為英文、日文與中文瀏覽。本會將把多年來延續的韓中日書藝交流歷史延伸至線上，讓更多跨越國界的書藝家與愛好者共同分享本會的活動。

新網站將成為活絡本會社群的基地。我們將運用作家介紹、作品典藏、線上參展等多樣技術，擴展每一位作家的線上影響力(Online Presence)，並持續研擬支持此一目標的政策。期盼在展場結下的緣分得以在線上延續，讓作家與觀眾、作家與作家之間更加親近。

本會一路走來，秉持法古創新——師法古人以開新境，人書俱老——書與人一同深化。我們將守護此一精神，並率先為更多作家打造開放的舞台。明年春天，期待在藝術殿堂與各位相見。

衷心祝願各位會員闔家平安、身體健康。

2026年10月30日

社團法人東洋書藝協會 理事長 林宰弘`

type GreetingLang = 'ko' | 'en' | 'ja' | 'zh'

const GREETINGS: readonly { lang: GreetingLang; label: string; text: string }[] = [
  { lang: 'ko', label: '한국어', text: koreanGreeting },
  { lang: 'en', label: 'English', text: englishGreeting },
  { lang: 'ja', label: '日本語', text: japaneseGreeting },
  { lang: 'zh', label: '中文', text: chineseGreeting },
]

/** 편지 본문 — 끝의 날짜·서명 두 문단은 오른쪽 아래로 뗀다 */
function Letter({ text, lang }: { text: string; lang: GreetingLang }) {
  const paragraphs = text.split('\n\n')
  const body = paragraphs.slice(0, -2)
  const [date, signature] = paragraphs.slice(-2)
  return (
    <article className='ab-letter' lang={lang}>
      {body.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <div className='ab-letter__sign'>
        <p className='ab-letter__note'>{date}</p>
        <p>{signature}</p>
      </div>
    </article>
  )
}

export function GreetingsTabs() {
  return (
    <AboutChapter
      id='greeting'
      tc='書境'
      eyebrow='제23회 대한민국 동양서예대전'
      title='이사장 인사말씀'
    >
      <TabsPrimitive.Root defaultValue='ko'>
        <TabsPrimitive.List className='ab-langs'>
          {GREETINGS.map(({ lang, label }) => (
            <TabsPrimitive.Trigger key={lang} value={lang} lang={lang} className='ab-lang'>
              {label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {GREETINGS.map(({ lang, text }) => (
          <TabsPrimitive.Content key={lang} value={lang}>
            <Letter text={text} lang={lang} />
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    </AboutChapter>
  )
}
