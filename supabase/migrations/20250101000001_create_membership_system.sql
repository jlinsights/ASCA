-- 문화 예술 단체 특화 회원 관리 시스템 스키마
-- 2025-01-01

-- 회원 등급 테이블
CREATE TABLE membership_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name_ko VARCHAR(100) NOT NULL,
    display_name_en VARCHAR(100) NOT NULL,
    description_ko TEXT,
    description_en TEXT,
    privileges JSONB NOT NULL DEFAULT '{}',
    max_mentees INTEGER DEFAULT 0,
    can_teach BOOLEAN DEFAULT FALSE,
    can_evaluate BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회원 기본 정보 테이블
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name_ko VARCHAR(50),
    last_name_ko VARCHAR(50),
    first_name_en VARCHAR(50),
    last_name_en VARCHAR(50),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    residence_country VARCHAR(50),
    residence_city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    preferred_language VARCHAR(10) DEFAULT 'ko',
    membership_level_id UUID REFERENCES membership_levels(id),
    membership_status VARCHAR(20) DEFAULT 'active',
    joined_date DATE DEFAULT CURRENT_DATE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_image_url TEXT,
    bio_ko TEXT,
    bio_en TEXT,
    website_url TEXT,
    social_media JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예술가 프로필 테이블
CREATE TABLE artistic_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    primary_art_form VARCHAR(100) NOT NULL, -- 서예, 캘리그래피, 전각 등
    secondary_art_forms VARCHAR(100)[], -- 복수 예술 분야
    years_of_experience INTEGER,
    education_background JSONB, -- 교육 이력
    teaching_experience JSONB, -- 교육 경험
    exhibition_history JSONB, -- 전시 이력
    awards_and_recognition JSONB, -- 수상 이력
    artistic_statement_ko TEXT,
    artistic_statement_en TEXT,
    portfolio_url TEXT,
    preferred_style VARCHAR(100), -- 전통, 현대, 실험적 등
    materials_specialty VARCHAR(100)[], -- 특화 재료
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성과/수상 테이블
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description_ko TEXT,
    description_en TEXT,
    achievement_type VARCHAR(50) NOT NULL, -- award, exhibition, publication, teaching, etc.
    category VARCHAR(100), -- 국제, 국내, 지역 등
    year INTEGER,
    organization VARCHAR(200),
    certificate_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES members(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자격증 테이블
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    name_ko VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    issuing_organization VARCHAR(200) NOT NULL,
    certification_type VARCHAR(100), -- teaching, technique, cultural, etc.
    level VARCHAR(50), -- 초급, 중급, 고급, 전문가 등
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(100),
    certificate_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES members(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문화적 배경 테이블
CREATE TABLE cultural_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    cultural_heritage VARCHAR(100)[], -- 문화유산 분야
    traditional_art_forms VARCHAR(100)[], -- 전통 예술 분야
    cultural_region VARCHAR(100), -- 문화권
    language_skills JSONB, -- 언어 능력
    cultural_exchange_experience JSONB, -- 문화 교류 경험
    international_connections JSONB, -- 국제 네트워크
    cultural_mentorship JSONB, -- 문화 멘토십
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 멘토링 관계 테이블
CREATE TABLE mentoring_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES members(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES members(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- formal, informal, cultural, technical
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
    goals_ko TEXT,
    goals_en TEXT,
    progress_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- 회원 활동 로그 테이블
CREATE TABLE member_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- login, profile_update, achievement_added, etc.
    description_ko TEXT,
    description_en TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_members_clerk_user_id ON members(clerk_user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_level_id ON members(membership_level_id);
CREATE INDEX idx_members_membership_status ON members(membership_status);
CREATE INDEX idx_artistic_profiles_member_id ON artistic_profiles(member_id);
CREATE INDEX idx_achievements_member_id ON achievements(member_id);
CREATE INDEX idx_certifications_member_id ON certifications(member_id);
CREATE INDEX idx_cultural_backgrounds_member_id ON cultural_backgrounds(member_id);
CREATE INDEX idx_mentoring_relationships_mentor_id ON mentoring_relationships(mentor_id);
CREATE INDEX idx_mentoring_relationships_mentee_id ON mentoring_relationships(mentee_id);
CREATE INDEX idx_member_activity_logs_member_id ON member_activity_logs(member_id);
CREATE INDEX idx_member_activity_logs_created_at ON member_activity_logs(created_at);

-- 기본 회원 등급 데이터 삽입
INSERT INTO membership_levels (name, display_name_ko, display_name_en, description_ko, description_en, privileges, max_mentees, can_teach, can_evaluate, can_approve) VALUES
('honorary_master', '명예 마스터', 'Honorary Master', '평생 공로상 수상자, 특별 권한 보유', 'Lifetime achievement recipients with special privileges', '{"all_access": true, "special_events": true, "vip_access": true}', 10, true, true, true),
('certified_master', '인증 마스터', 'Certified Master', '교육 자격을 갖춘 전문 서예가', 'Professional calligraphers with teaching credentials', '{"teaching": true, "evaluation": true, "mentoring": true}', 5, true, true, false),
('advanced_practitioner', '고급 실습자', 'Advanced Practitioner', '전시 이력이 있는 경험 많은 예술가', 'Experienced artists with exhibition history', '{"portfolio_sharing": true, "community_leadership": true}', 2, false, false, false),
('student', '학습자', 'Student', '다양한 기술 수준의 학습 회원', 'Learning members with various skill levels', '{"basic_community": true, "learning_resources": true}', 0, false, false, false),
('institutional_member', '기관 회원', 'Institutional Member', '박물관, 학교, 문화 기관', 'Museums, schools, cultural organizations', '{"institutional_access": true, "collaboration": true}', 0, false, false, false),
('international_associate', '국제 협회원', 'International Associate', '서예 애호가들의 글로벌 네트워크', 'Global network of calligraphy enthusiasts', '{"international_network": true, "cultural_exchange": true}', 0, false, false, false);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE artistic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity_logs ENABLE ROW LEVEL SECURITY;

-- 회원 테이블 RLS 정책
CREATE POLICY "Members can view public profiles" ON members
    FOR SELECT USING (is_public = true OR auth.uid()::text = clerk_user_id);

CREATE POLICY "Members can update own profile" ON members
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Members can insert own profile" ON members
    FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- 예술가 프로필 RLS 정책
CREATE POLICY "Members can view public artistic profiles" ON artistic_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = artistic_profiles.member_id 
            AND (members.is_public = true OR auth.uid()::text = members.clerk_user_id)
        )
    );

CREATE POLICY "Members can manage own artistic profile" ON artistic_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = artistic_profiles.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

-- 성과 테이블 RLS 정책
CREATE POLICY "Members can view verified achievements" ON achievements
    FOR SELECT USING (is_verified = true OR 
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = achievements.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

CREATE POLICY "Members can manage own achievements" ON achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = achievements.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

-- 자격증 테이블 RLS 정책
CREATE POLICY "Members can view verified certifications" ON certifications
    FOR SELECT USING (is_verified = true OR 
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = certifications.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

CREATE POLICY "Members can manage own certifications" ON certifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = certifications.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

-- 문화적 배경 RLS 정책
CREATE POLICY "Members can view public cultural backgrounds" ON cultural_backgrounds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = cultural_backgrounds.member_id 
            AND (members.is_public = true OR auth.uid()::text = members.clerk_user_id)
        )
    );

CREATE POLICY "Members can manage own cultural background" ON cultural_backgrounds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = cultural_backgrounds.member_id 
            AND auth.uid()::text = members.clerk_user_id
        )
    );

-- 멘토링 관계 RLS 정책
CREATE POLICY "Members can view own mentoring relationships" ON mentoring_relationships
    FOR SELECT USING (
        mentor_id IN (
            SELECT id FROM members WHERE auth.uid()::text = clerk_user_id
        ) OR mentee_id IN (
            SELECT id FROM members WHERE auth.uid()::text = clerk_user_id
        )
    );

CREATE POLICY "Members can manage own mentoring relationships" ON mentoring_relationships
    FOR ALL USING (
        mentor_id IN (
            SELECT id FROM members WHERE auth.uid()::text = clerk_user_id
        ) OR mentee_id IN (
            SELECT id FROM members WHERE auth.uid()::text = clerk_user_id
        )
    );

-- 활동 로그 RLS 정책
CREATE POLICY "Members can view own activity logs" ON member_activity_logs
    FOR SELECT USING (
        member_id IN (
            SELECT id FROM members WHERE auth.uid()::text = clerk_user_id
        )
    );

CREATE POLICY "System can insert activity logs" ON member_activity_logs
    FOR INSERT WITH CHECK (true);

-- 함수 생성: 회원 등급 업데이트 시 자동 업데이트
CREATE OR REPLACE FUNCTION update_member_level_privileges()
RETURNS TRIGGER AS $$
BEGIN
    -- 회원 등급이 변경되면 관련 권한도 업데이트
    IF NEW.membership_level_id != OLD.membership_level_id THEN
        -- 여기에 추가 로직을 구현할 수 있습니다
        -- 예: 멘토링 관계 재평가, 권한 변경 알림 등
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_level_privileges
    AFTER UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_member_level_privileges();

-- 함수 생성: 활동 로그 자동 생성
CREATE OR REPLACE FUNCTION log_member_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO member_activity_logs (member_id, activity_type, description_ko, description_en, metadata)
    VALUES (
        NEW.id,
        'profile_updated',
        '프로필 정보가 업데이트되었습니다',
        'Profile information has been updated',
        jsonb_build_object('updated_fields', array_remove(ARRAY(
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'members' 
            AND column_name != 'updated_at'
        ), NULL))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_member_activity
    AFTER UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION log_member_activity(); 