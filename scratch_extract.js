const fs = require('fs');
const content = fs.readFileSync('app/profile/membership/page.tsx', 'utf-8');

const parts = content.split('export default function MemberProfilePage() {');

let before = parts[0];
let after = 'export default function MemberProfilePage() {' + parts[1];

// Find the mock data block
const lines = before.split('\n');
const mockStart = lines.findIndex(l => l.includes('// Mock 사용자 데이터'));
const mockEnd = lines.findIndex(l => l.includes('export default function MemberProfilePage() {'));

const mockLines = lines.slice(mockStart, mockEnd).join('\n');

let newMockData = mockLines
  .replace('const mockMemberProfile', 'export const mockMemberProfile')
  .replace('const mockTierInfo', 'export const mockTierInfo')
  .replace('const mockActivities', 'export const mockActivities');

const imports = `import type {
  MemberProfile,
  MembershipTierInfo,
  CalligraphyStyle,
  Achievement,
  CalligraphyCertification,
  MemberActivityLog,
} from '@/lib/types/membership'

export const styleNames: Record<CalligraphyStyle, string> = {
  kaishu: '해서',
  xingshu: '행서',
  caoshu: '초서',
  lishu: '예서',
  zhuanshu: '전서',
  modern: '현대서예',
  experimental: '실험서예',
}
`;

fs.mkdirSync('app/profile/membership/_components', { recursive: true });
fs.writeFileSync('app/profile/membership/_components/mock-data.ts', imports + '\n' + newMockData, 'utf-8');

// remove styleNames from inside the component
let newAfter = after.replace(/  \/\/ 서예 스타일 한국어 매핑[\s\S]*?실험서예',\n  \}\n/, '');

let newContent = lines.slice(0, mockStart).join('\n') + '\nimport { mockMemberProfile, mockTierInfo, mockActivities, styleNames } from "./_components/mock-data"\n\n' + newAfter;

fs.writeFileSync('app/profile/membership/page.tsx', newContent, 'utf-8');
console.log('Mock data extracted and page.tsx updated.');
