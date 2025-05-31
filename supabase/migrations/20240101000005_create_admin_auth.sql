-- 관리자 역할 및 권한 관리 테이블 생성

-- 관리자 역할 테이블
CREATE TABLE admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 사용자 테이블 (auth.users와 연결)
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 활동 로그 테이블
CREATE TABLE admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- 기본 역할 데이터 삽입
INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', '최고 관리자', '{
  "cms": {
    "notices": ["create", "read", "update", "delete", "publish"],
    "exhibitions": ["create", "read", "update", "delete", "publish"],
    "events": ["create", "read", "update", "delete", "publish"],
    "comments": ["read", "approve", "delete"]
  },
  "artists": {
    "artists": ["create", "read", "update", "delete"],
    "artworks": ["create", "read", "update", "delete"]
  },
  "admin": {
    "users": ["create", "read", "update", "delete"],
    "roles": ["create", "read", "update", "delete"],
    "logs": ["read"],
    "backup": ["create", "restore"]
  }
}'),
('content_manager', '콘텐츠 관리자', '{
  "cms": {
    "notices": ["create", "read", "update", "delete", "publish"],
    "exhibitions": ["create", "read", "update", "delete", "publish"],
    "events": ["create", "read", "update", "delete", "publish"],
    "comments": ["read", "approve", "delete"]
  },
  "artists": {
    "artists": ["create", "read", "update"],
    "artworks": ["create", "read", "update"]
  }
}'),
('editor', '편집자', '{
  "cms": {
    "notices": ["create", "read", "update"],
    "exhibitions": ["create", "read", "update"],
    "events": ["create", "read", "update"],
    "comments": ["read", "approve"]
  }
}'),
('viewer', '조회자', '{
  "cms": {
    "notices": ["read"],
    "exhibitions": ["read"],
    "events": ["read"],
    "comments": ["read"]
  },
  "artists": {
    "artists": ["read"],
    "artworks": ["read"]
  }
}');

-- RLS (Row Level Security) 정책 설정
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능한 정책
CREATE POLICY "Admin roles access" ON admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admin users access" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
      AND (ar.permissions->'admin'->'users' ? 'read')
    )
  );

CREATE POLICY "Admin activity logs access" ON admin_activity_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
      AND (ar.permissions->'admin'->'logs' ? 'read')
    )
  );

-- 관리자 권한 확인 함수
CREATE OR REPLACE FUNCTION check_admin_permission(
  permission_path TEXT,
  action_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  permission_parts TEXT[];
  current_level JSONB;
  part TEXT;
BEGIN
  -- 현재 사용자의 권한 가져오기
  SELECT ar.permissions INTO user_permissions
  FROM admin_users au
  JOIN admin_roles ar ON au.role_id = ar.id
  WHERE au.user_id = auth.uid() AND au.is_active = true;
  
  IF user_permissions IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 권한 경로 파싱 (예: "cms.notices")
  permission_parts := string_to_array(permission_path, '.');
  current_level := user_permissions;
  
  -- 권한 경로 탐색
  FOREACH part IN ARRAY permission_parts
  LOOP
    IF current_level ? part THEN
      current_level := current_level -> part;
    ELSE
      RETURN FALSE;
    END IF;
  END LOOP;
  
  -- 액션 권한 확인
  RETURN current_level ? action_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자 활동 로그 기록 함수
CREATE OR REPLACE FUNCTION log_admin_activity(
  action_name TEXT,
  resource_type_param TEXT DEFAULT NULL,
  resource_id_param UUID DEFAULT NULL,
  details_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  admin_user_id_val UUID;
BEGIN
  -- 현재 관리자 사용자 ID 가져오기
  SELECT id INTO admin_user_id_val
  FROM admin_users
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF admin_user_id_val IS NOT NULL THEN
    INSERT INTO admin_activity_logs (
      admin_user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      admin_user_id_val,
      action_name,
      resource_type_param,
      resource_id_param,
      details_param
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 마지막 로그인 시간 업데이트 함수
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS VOID AS $$
BEGIN
  UPDATE admin_users 
  SET last_login_at = NOW()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;