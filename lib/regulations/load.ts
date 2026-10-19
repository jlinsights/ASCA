import 'server-only'
import { readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, type RegulationEntry } from './catalog'
import { parseRegulation } from './parse'
import type { RegulationDocument } from './types'

/** 빌드 시 정적 생성 단계에서만 읽는다 (각 페이지는 dynamicParams = false) */
export function loadRegulation(entry: RegulationEntry): RegulationDocument {
  const source = readFileSync(path.join(process.cwd(), 'regulations', entry.file), 'utf8')
  return parseRegulation(source, { legacyAnchors: LEGACY_ANCHORS })
}
