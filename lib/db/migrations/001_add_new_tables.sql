-- Migration: Add new tables for AI vision, learning progress, and system management
-- Version: 001
-- Date: 2025-01-31

-- Create calligraphy_analyses table
CREATE TABLE IF NOT EXISTS calligraphy_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  member_id TEXT REFERENCES members(id),
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  image_metadata TEXT,
  analysis_config TEXT,
  calligraphy_style TEXT NOT NULL CHECK (calligraphy_style IN ('kaishu', 'xingshu', 'caoshu', 'lishu', 'zhuanshu', 'mixed')),
  overall_score INTEGER,
  confidence REAL,
  brush_control_score INTEGER,
  ink_flow_score INTEGER,
  stroke_quality_score INTEGER,
  rhythm_consistency_score INTEGER,
  composition_score INTEGER,
  strokes_detected INTEGER DEFAULT 0,
  characters_analyzed INTEGER DEFAULT 0,
  strokes_data TEXT,
  characters_data TEXT,
  composition_data TEXT,
  feedback TEXT,
  improvement_suggestions TEXT,
  processing_time INTEGER,
  analysis_version TEXT DEFAULT '1.0',
  is_training_data INTEGER DEFAULT 0,
  expert_validation TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'archived')),
  error_message TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  skill_category TEXT NOT NULL CHECK (skill_category IN ('brush_control', 'ink_flow', 'stroke_quality', 'composition', 'character_structure')),
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_analyses INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  improvement_rate REAL DEFAULT 0,
  target_level INTEGER DEFAULT 5,
  target_score INTEGER DEFAULT 80,
  target_date INTEGER,
  practice_frequency TEXT DEFAULT 'weekly' CHECK (practice_frequency IN ('daily', 'weekly', 'monthly', 'irregular')),
  preferred_time_slots TEXT,
  achievements TEXT,
  milestones TEXT,
  last_practice_date INTEGER,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  UNIQUE(member_id, skill_category)
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  data_type TEXT NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public INTEGER DEFAULT 0,
  is_editable INTEGER DEFAULT 1,
  validation_rules TEXT,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  UNIQUE(category, key)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  result TEXT NOT NULL DEFAULT 'success' CHECK (result IN ('success', 'failure', 'error')),
  error_message TEXT,
  metadata TEXT,
  timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create file_storage table
CREATE TABLE IF NOT EXISTS file_storage (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'video', 'audio', 'archive')),
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  format TEXT,
  color_space TEXT,
  purpose TEXT NOT NULL DEFAULT 'other' CHECK (purpose IN ('profile_image', 'artwork_image', 'analysis_image', 'document', 'certificate', 'other')),
  related_entity_type TEXT,
  related_entity_id TEXT,
  is_public INTEGER DEFAULT 0,
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (access_level IN ('public', 'members_only', 'admin_only', 'private')),
  processing_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'ready', 'failed')),
  checksum_md5 TEXT,
  checksum_sha256 TEXT,
  expires_at INTEGER,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'membership', 'event', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  title_ko TEXT,
  title_en TEXT,
  title_cn TEXT,
  title_jp TEXT,
  message_ko TEXT,
  message_en TEXT,
  message_cn TEXT,
  message_jp TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read INTEGER DEFAULT 0,
  read_at INTEGER,
  send_email INTEGER DEFAULT 0,
  email_sent_at INTEGER,
  send_push INTEGER DEFAULT 0,
  push_sent_at INTEGER,
  expires_at INTEGER,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('api_response_time', 'database_query_time', 'image_processing_time', 'ai_analysis_time', 'page_load_time', 'error_rate')),
  endpoint TEXT,
  method TEXT,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  request_Id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  metadata TEXT,
  timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON calligraphy_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_member_id ON calligraphy_analyses(member_id);
CREATE INDEX IF NOT EXISTS idx_analysis_style ON calligraphy_analyses(calligraphy_style);
CREATE INDEX IF NOT EXISTS idx_analysis_status ON calligraphy_analyses(status);
CREATE INDEX IF NOT EXISTS idx_analysis_score ON calligraphy_analyses(overall_score);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON calligraphy_analyses(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_progress_member_id ON learning_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_category ON learning_progress(skill_category);
CREATE INDEX IF NOT EXISTS idx_learning_progress_level ON learning_progress(current_level);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_file_storage_user_id ON file_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_type ON file_storage(file_type);
CREATE INDEX IF NOT EXISTS idx_file_storage_purpose ON file_storage(purpose);
CREATE INDEX IF NOT EXISTS idx_file_storage_status ON file_storage(processing_status);

CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metric_timestamp ON performance_metrics(timestamp);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (id, category, key, value, data_type, description, is_public) VALUES
  ('general_site_name', 'general', 'site_name', 'ASCA - Korean Calligraphy Association', 'string', 'Site name', 1),
  ('general_max_upload_size', 'general', 'max_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', 0),
  ('ai_vision_max_image_size', 'ai_vision', 'max_image_size', '5242880', 'number', 'Maximum image size for AI analysis (5MB)', 0),
  ('ai_vision_supported_formats', 'ai_vision', 'supported_formats', '["jpg", "jpeg", "png", "webp"]', 'json', 'Supported image formats', 0),
  ('membership_auto_approval', 'membership', 'auto_approval', 'false', 'boolean', 'Enable automatic membership approval', 0),
  ('cultural_exchange_booking_window', 'cultural_exchange', 'booking_window_days', '30', 'number', 'Days before program start to allow booking', 0);