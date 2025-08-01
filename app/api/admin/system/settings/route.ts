import { NextRequest, NextResponse } from 'next/server';
import { getSystemSetting, setSystemSetting } from '@/lib/db/utils';
import { createAuditLog } from '@/lib/db/utils';

// GET - 시스템 설정 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');
    const publicOnly = searchParams.get('public') === 'true';

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    if (category && key) {
      // 특정 설정 조회
      const value = await getSystemSetting(category, key);
      
      return NextResponse.json({
        success: true,
        setting: {
          category,
          key,
          value
        }
      });
    }

    // 전체 설정 조회 (카테고리별 필터링 지원)
    const { db } = await import('@/lib/db');
    const { systemSettings } = await import('@/lib/db/schema');
    const { eq, and } = await import('drizzle-orm');

    const conditions = [];
    
    if (category) {
      conditions.push(eq(systemSettings.category, category));
    }
    
    if (publicOnly) {
      conditions.push(eq(systemSettings.isPublic, true));
    }

    const settings = await db
      .select({
        id: systemSettings.id,
        category: systemSettings.category,
        key: systemSettings.key,
        value: systemSettings.value,
        dataType: systemSettings.dataType,
        description: systemSettings.description,
        isPublic: systemSettings.isPublic,
        isEditable: systemSettings.isEditable,
        updatedAt: systemSettings.updatedAt
      })
      .from(systemSettings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(systemSettings.category, systemSettings.key);

    // 데이터 타입에 따라 값 변환
    const formattedSettings = settings.map(setting => ({
      ...setting,
      value: setting.dataType === 'number' ? parseFloat(setting.value) :
             setting.dataType === 'boolean' ? setting.value === 'true' :
             setting.dataType === 'json' ? JSON.parse(setting.value) :
             setting.value,
      updatedAt: new Date(Number(setting.updatedAt) * 1000)
    }));

    return NextResponse.json({
      success: true,
      settings: formattedSettings
    });

  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, error: '시스템 설정을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT - 시스템 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, key, value, description } = body;

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    if (!category || !key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '카테고리, 키, 값이 필요합니다' },
        { status: 400 }
      );
    }

    // 기존 설정값 조회 (감사 로그용)
    const oldValue = await getSystemSetting(category, key);

    // 설정 업데이트
    await setSystemSetting(category, key, value, undefined, 'admin-user-id');

    // 감사 로그 기록
    await createAuditLog(
      'admin-user-id',
      'UPDATE',
      'system_settings',
      `${category}_${key}`,
      { value: oldValue },
      { value },
      { category, key, description },
      'medium'
    );

    return NextResponse.json({
      success: true,
      message: '시스템 설정이 업데이트되었습니다',
      setting: {
        category,
        key,
        value
      }
    });

  } catch (error) {
    console.error('Error updating system setting:', error);
    return NextResponse.json(
      { success: false, error: '시스템 설정 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST - 새 시스템 설정 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      category, 
      key, 
      value, 
      dataType, 
      description, 
      isPublic = false, 
      isEditable = true,
      validationRules 
    } = body;

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    if (!category || !key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '카테고리, 키, 값이 필요합니다' },
        { status: 400 }
      );
    }

    // 기존 설정 존재 확인
    const existingSetting = await getSystemSetting(category, key);
    if (existingSetting !== null) {
      return NextResponse.json(
        { success: false, error: '동일한 설정이 이미 존재합니다' },
        { status: 409 }
      );
    }

    const { db } = await import('@/lib/db');
    const { systemSettings } = await import('@/lib/db/schema');

    const now = Math.floor(Date.now() / 1000);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const inferredType = dataType || (
      typeof value === 'number' ? 'number' :
      typeof value === 'boolean' ? 'boolean' :
      typeof value === 'object' ? 'json' : 'string'
    );

    await db.insert(systemSettings).values({
      id: `${category}_${key}`,
      category,
      key,
      value: stringValue,
      dataType: inferredType,
      description,
      isPublic,
      isEditable,
      validationRules: validationRules ? JSON.stringify(validationRules) : null,
      createdBy: 'admin-user-id',
      updatedBy: 'admin-user-id',
      createdAt: now,
      updatedAt: now
    });

    // 감사 로그 기록
    await createAuditLog(
      'admin-user-id',
      'CREATE',
      'system_settings',
      `${category}_${key}`,
      null,
      { category, key, value: stringValue, dataType: inferredType },
      { description, isPublic, isEditable },
      'medium'
    );

    return NextResponse.json({
      success: true,
      message: '새 시스템 설정이 생성되었습니다',
      setting: {
        category,
        key,
        value,
        dataType: inferredType
      }
    });

  } catch (error) {
    console.error('Error creating system setting:', error);
    return NextResponse.json(
      { success: false, error: '시스템 설정 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}