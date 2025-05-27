'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Award, Building } from 'lucide-react';

interface HistoryEvent {
  year: string;
  month?: string;
  day?: string;
  title: string;
  description?: string;
  venue?: string;
  period?: string;
  type: 'exhibition' | 'appointment' | 'meeting' | 'establishment' | 'contest' | 'cultural';
  icon: React.ReactNode;
}

export default function HistoryPage() {
  const { t } = useLanguage();

  const historyEvents: HistoryEvent[] = [
    {
      year: '2025',
      month: '2월',
      day: '8일',
      title: '2025 신임 임원 위촉식 및 초대작가증 수여식',
      venue: '예술가의집 (Arts Council Korea)',
      period: '오후 1시 ~ 4시',
      type: 'appointment',
      icon: <Award className="w-4 h-4" />
    },
    {
      year: '2025',
      month: '2월',
      day: '8일',
      title: '2025 정기이사회',
      venue: '예술가의집 (Arts Council Korea)',
      period: '오후 1시 ~ 4시',
      type: 'meeting',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '2024',
      month: '10월',
      day: '18일',
      title: '2024 신임 임원 위촉식 및 초대작가증 수여식',
      venue: '예술가의집 (Arts Council Korea)',
      period: '오후 1시 ~ 4시',
      type: 'appointment',
      icon: <Award className="w-4 h-4" />
    },
    {
      year: '2024',
      month: '10월',
      day: '18일',
      title: '2024 임시총회',
      venue: '예술가의집 (Arts Council Korea)',
      period: '오후 1시 ~ 4시',
      type: 'meeting',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '2024',
      month: '8월',
      day: '31일 ~ 9월 8일',
      title: '第21回 大韓民國 東洋書藝大展 / 第21回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2024',
      month: '8월',
      day: '3일',
      title: '2024 대한민국 동양서예대전 휘호대회 및 사단법인 동양서예협회 임원위촉 수여식',
      type: 'contest',
      icon: <Award className="w-4 h-4" />
    },
    {
      year: '2024',
      month: '1월',
      day: '13일',
      title: '2024 정기총회',
      type: 'meeting',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '2023',
      month: '10월',
      day: '1일',
      title: '第3期 社團法人 東洋書藝協會 임재홍 이사장 취임',
      description: '임재홍 이사장이 제3기 동양서예협회 이사장으로 취임하였습니다.',
      type: 'appointment',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '2023',
      month: '5월',
      day: '31일 ~ 6월 10일',
      title: '第20回 大韓民國 東洋書藝大展 / 第20回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2022',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第19回 大韓民國 東洋書藝大展 / 第19回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2021',
      month: '7월',
      day: '30일 ~ 8월 8일',
      title: '第18回 大韓民國 東洋書藝大展 / 第18回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2020',
      month: '10월',
      day: '10일 ~ 20일',
      title: '第17回 大韓民國 東洋書藝大展 / 第17回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      description: '코로나19바이러스 확산 사태로 예술의전당 전시장 운영이 중단되어 전시행사가 모두 취소되었음으로 인터넷 전시로 대체',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2019',
      month: '7월',
      day: '3일 ~ 10일',
      title: '第16回 大韓民國 東洋書藝大展 / 第16回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2018',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第15回 大韓民國 東洋書藝大展 / 第15回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2017',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第14回 大韓民國 東洋書藝大展 / 第14回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2017',
      month: '2월',
      day: '22일',
      title: '第2期 社團法人 東洋書藝協會 惺谷 林炫圻 理事長 就任',
      description: '惺谷 林炫圻 선생이 제2기 동양서예협회 이사장으로 취임하였습니다.',
      type: 'appointment',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '2016',
      month: '12월',
      day: '6일 ~ 18일',
      title: '韓·中·日 臺灣國際書藝展',
      venue: '진천군립생거판화미술관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2016',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第13回 大韓民國 東洋書藝大展 / 第13回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2015',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第12回 大韓民國 東洋書藝大展 / 第12回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2014',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第11回 大韓民國 東洋書藝大展 / 第11回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2013',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第10回 大韓民國 東洋書藝大展 / 第10回 韓·中·日 東洋書藝招待作家展',
      venue: '인사동 한국미술관 3층 전관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2012',
      month: '10월',
      day: '29일',
      title: '社團法人 東洋書藝協會 法人 設立 許可',
      description: '문화체육관광부로부터 법인 설립 허가를 받아 惺谷 林炫圻 선생이 초대 이사장으로 취임하였습니다.',
      type: 'establishment',
      icon: <Building className="w-4 h-4" />
    },
    {
      year: '2012',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第9回 大韓民國 東洋書藝大展 / 第9回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2012',
      month: '4월',
      day: '9일',
      title: '韓·日 書藝二人展',
      venue: '일본 오사카 시립미술관',
      type: 'cultural',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2011',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第8回 大韓民國 東洋書藝大展 / 第8回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2010',
      month: '11월',
      day: '22일 ~ 30일',
      title: '韓·日 書藝 兩人展',
      venue: '예술의전당 서울서예박물관',
      type: 'cultural',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2010',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第7回 大韓民國 東洋書藝大展 / 第7回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2009',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第6回 大韓民國 東洋書藝大展 / 第6回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2008',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第5回 大韓民國 東洋書藝大展 / 第5回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2007',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第4回 大韓民國 東洋書藝大展 / 第4回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2006',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第3回 大韓民國 東洋書藝大展 / 第3回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2005',
      month: '7월',
      day: '20일 ~ 26일',
      title: '第2回 大韓民國 東洋書藝大展 / 第2回 韓·中·日 東洋書藝招待作家展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2001',
      month: '4월',
      day: '17일 ~ 23일',
      title: '第1回 大韓民國 東洋書藝大展 / 第1回 韓·中·日 東洋書藝招待作家展 / 惺谷 林炫圻 回甲紀念展',
      venue: '예술의전당 서울서예박물관',
      type: 'exhibition',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '2000',
      month: '7월',
      day: '30일',
      title: '韓·中·日 書藝文化交流協會 惺谷 林炫圻 運營委員長 被命',
      type: 'appointment',
      icon: <Users className="w-4 h-4" />
    },
    {
      year: '1998',
      month: '10월',
      day: '20일 ~ 22일',
      title: '韓·中·日 書藝文化交流展',
      venue: '일본 동경 문화센터',
      type: 'cultural',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '1998',
      month: '5월',
      day: '30일 ~ 6월 2일',
      title: '韓·中·日 東洋國際書藝展',
      venue: '세종문화회관',
      type: 'cultural',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      year: '1997',
      month: '9월',
      title: '韓·中·日 書藝文化交流聯合會展',
      venue: '서울, 북경, 서안 역사 박물관',
      type: 'cultural',
      icon: <MapPin className="w-4 h-4" />
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'appointment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'meeting':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'establishment':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'contest':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cultural':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'exhibition':
        return t('exhibition');
      case 'appointment':
        return t('appointment');
      case 'meeting':
        return t('generalMeeting');
      case 'establishment':
        return t('corporationEstablishment');
      case 'contest':
        return t('calligraphyContest');
      case 'cultural':
        return t('culturalExchange');
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('historyTitle')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('historyDescription')}
            </p>
            
            {/* Contact Message */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="text-muted-foreground mb-4">
                {t('contactMessage')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  {t('consultationInquiry')}
                </button>
                <button className="px-6 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  {t('consultationReservation')}
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {historyEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Date */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {event.year}
                      </div>
                      {event.month && (
                        <div className="text-sm text-muted-foreground">
                          {event.month}
                        </div>
                      )}
                      {event.day && (
                        <div className="text-xs text-muted-foreground">
                          {event.day}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getEventTypeColor(event.type)}>
                          <div className="flex items-center gap-1">
                            {event.icon}
                            {getEventTypeLabel(event.type)}
                          </div>
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        {event.venue && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{t('venue')}: {event.venue}</span>
                          </div>
                        )}
                        {event.period && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{t('period')}: {event.period}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              * 더 자세한 정보는 협회 사무국으로 문의해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 