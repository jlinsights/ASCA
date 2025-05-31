-- 샘플 관리자 사용자 데이터 삽입

-- 먼저 auth.users 테이블에 샘플 사용자 생성 (실제로는 Supabase Auth를 통해 생성해야 함)
-- 이는 개발용 샘플 데이터입니다.

-- 샘플 관리자 사용자 삽입 (실제 운영에서는 Supabase Auth를 통해 생성)
INSERT INTO admin_users (user_id, role_id, name, email, is_active) 
SELECT 
  gen_random_uuid(),
  ar.id,
  '시스템 관리자',
  'admin@asca.kr',
  true
FROM admin_roles ar 
WHERE ar.name = 'super_admin'
ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (user_id, role_id, name, email, is_active) 
SELECT 
  gen_random_uuid(),
  ar.id,
  '콘텐츠 관리자',
  'content@asca.kr',
  true
FROM admin_roles ar 
WHERE ar.name = 'content_manager'
ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (user_id, role_id, name, email, is_active) 
SELECT 
  gen_random_uuid(),
  ar.id,
  '편집자',
  'editor@asca.kr',
  true
FROM admin_roles ar 
WHERE ar.name = 'editor'
ON CONFLICT (email) DO NOTHING;

-- 샘플 활동 로그 데이터
INSERT INTO admin_activity_logs (admin_user_id, action, resource_type, resource_id, details, created_at)
SELECT 
  au.id,
  'login',
  NULL,
  NULL,
  '{"ip": "127.0.0.1", "user_agent": "Mozilla/5.0"}',
  NOW() - INTERVAL '1 hour'
FROM admin_users au
WHERE au.email = 'admin@asca.kr';

INSERT INTO admin_activity_logs (admin_user_id, action, resource_type, resource_id, details, created_at)
SELECT 
  au.id,
  'create_notice',
  'notice',
  gen_random_uuid(),
  '{"title": "새 공지사항 작성", "category": "일반"}',
  NOW() - INTERVAL '30 minutes'
FROM admin_users au
WHERE au.email = 'content@asca.kr';

INSERT INTO admin_activity_logs (admin_user_id, action, resource_type, resource_id, details, created_at)
SELECT 
  au.id,
  'update_exhibition',
  'exhibition',
  gen_random_uuid(),
  '{"title": "전시회 정보 수정", "status": "published"}',
  NOW() - INTERVAL '15 minutes'
FROM admin_users au
WHERE au.email = 'editor@asca.kr';