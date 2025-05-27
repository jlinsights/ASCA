import { supabase } from '../supabase'
import type { AdminUser, AdminRole, AdminActivityLog, AdminUserFormData, AdminRoleFormData } from '@/types/auth'

// 인증 관련 함수들
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const adminUser = await getAdminUserByAuthId(data.user.id)
  if (!adminUser || !adminUser.is_active) {
    await supabase.auth.signOut()
    throw new Error('관리자 권한이 없거나 비활성화된 계정입니다.')
  }

  await supabase.rpc('update_admin_last_login')
  await logAdminActivity('login')
  return { user: data.user, adminUser }
}

export async function signOut() {
  await logAdminActivity('logout')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) return null
  return await getAdminUserByAuthId(user.id)
}

export async function getAdminUserByAuthId(authId: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select(`*,role:admin_roles(*)`)
    .eq('user_id', authId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select(`*,role:admin_roles(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}// 나머지 관리자 관련 함수들
export async function createAdminUser(userData: AdminUserFormData, password: string): Promise<AdminUser> {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password,
    email_confirm: true
  })

  if (authError) throw authError

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .insert([{
      user_id: authData.user.id,
      name: userData.name,
      email: userData.email,
      role_id: userData.role_id,
      is_active: userData.is_active
    }])
    .select(`*,role:admin_roles(*)`)
    .single()

  if (adminError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw adminError
  }

  await logAdminActivity('create_admin_user', 'admin_user', adminUser.id, {
    name: userData.name,
    email: userData.email,
    role_id: userData.role_id
  })

  return adminUser
}

export async function updateAdminUser(id: string, userData: AdminUserFormData): Promise<AdminUser> {
  const { data, error } = await supabase
    .from('admin_users')
    .update({
      name: userData.name,
      email: userData.email,
      role_id: userData.role_id,
      is_active: userData.is_active
    })
    .eq('id', id)
    .select(`*,role:admin_roles(*)`)
    .single()

  if (error) throw error

  await logAdminActivity('update_admin_user', 'admin_user', id, userData)
  return data
}

export async function deleteAdminUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id)

  if (error) throw error
  await logAdminActivity('delete_admin_user', 'admin_user', id)
}// 역할 관련 함수들
export async function getAdminRoles(): Promise<AdminRole[]> {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createAdminRole(roleData: AdminRoleFormData): Promise<AdminRole> {
  const { data, error } = await supabase
    .from('admin_roles')
    .insert([roleData])
    .select()
    .single()

  if (error) throw error
  await logAdminActivity('create_admin_role', 'admin_role', data.id, roleData)
  return data
}

export async function updateAdminRole(id: string, roleData: AdminRoleFormData): Promise<AdminRole> {
  const { data, error } = await supabase
    .from('admin_roles')
    .update(roleData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  await logAdminActivity('update_admin_role', 'admin_role', id, roleData)
  return data
}

export async function deleteAdminRole(id: string): Promise<void> {
  const { error } = await supabase
    .from('admin_roles')
    .delete()
    .eq('id', id)

  if (error) throw error
  await logAdminActivity('delete_admin_role', 'admin_role', id)
}

// 권한 확인 함수
export async function hasPermission(resource: string, action: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_admin_permission', {
    permission_path: resource,
    action_name: action
  })

  if (error) return false
  return data || false
}

// 활동 로그 함수
export async function logAdminActivity(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  await supabase.rpc('log_admin_activity', {
    action_name: action,
    resource_type_param: resourceType,
    resource_id_param: resourceId,
    details_param: details
  })
}// 활동 로그 조회 함수들
export async function getAdminActivityLogs(limit = 50): Promise<AdminActivityLog[]> {
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select(`
      *,
      admin_user:admin_users(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getAdminActivityLogsByUser(userId: string, limit = 20): Promise<AdminActivityLog[]> {
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select(`
      *,
      admin_user:admin_users(name, email)
    `)
    .eq('admin_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}