const fs = require('fs');

const pageFile = 'app/profile/membership/page.tsx';
const content = fs.readFileSync(pageFile, 'utf-8');

const imports = content.slice(0, content.indexOf('export default function MemberProfilePage'));

// We will create ProfileTabs.tsx
const profileTabsContent = `
${imports}
interface ProfileTabsProps {
  profile: MemberProfile;
  tierInfo: MembershipTierInfo;
  activities: MemberActivityLog[];
  isEditing: boolean;
  editForm: Partial<MemberProfile>;
  setEditForm: (form: Partial<MemberProfile>) => void;
  parsedPrivacySettings: any;
}

export function ProfileTabs({ profile, tierInfo, activities, isEditing, editForm, setEditForm, parsedPrivacySettings }: ProfileTabsProps) {
  return (
    <div className='container mx-auto px-4 py-8'>
` + content.substring(content.indexOf('<Tabs defaultValue=\'overview\''), content.indexOf('      <LayoutFooter />')) + `    </div>
  )
}
`;

fs.writeFileSync('app/profile/membership/_components/profile-tabs.tsx', profileTabsContent);

// We will create ProfileHeader.tsx
const profileHeaderContent = `
${imports}
interface ProfileHeaderProps {
  profile: MemberProfile;
  tierInfo: MembershipTierInfo;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleSaveProfile: () => void;
  handleCancelEdit: () => void;
}

export function ProfileHeader({ profile, tierInfo, isEditing, setIsEditing, handleSaveProfile, handleCancelEdit }: ProfileHeaderProps) {
  return (
` + content.substring(content.indexOf('      {/* 프로필 헤더 */}'), content.indexOf('      <div className=\'container mx-auto px-4 py-8\'>')) + `  )
}
`;

fs.writeFileSync('app/profile/membership/_components/profile-header.tsx', profileHeaderContent);

// And rewrite page.tsx to use them
const newPageContent = `
${imports}import { ProfileHeader } from './_components/profile-header';
import { ProfileTabs } from './_components/profile-tabs';

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<MemberProfile>(mockMemberProfile)
  const [tierInfo, setTierInfo] = useState<MembershipTierInfo>(mockTierInfo)
  const [activities, setActivities] = useState<MemberActivityLog[]>(mockActivities)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MemberProfile>>(profile)

  const parsedPrivacySettings = profile.privacySettings ? JSON.parse(profile.privacySettings) : {}

  const handleSaveProfile = async () => {
    try {
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
    } catch (error) {
      logger.error('프로필 업데이트 실패', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleCancelEdit = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <ProfileHeader 
        profile={profile} 
        tierInfo={tierInfo} 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        handleSaveProfile={handleSaveProfile} 
        handleCancelEdit={handleCancelEdit} 
      />
      <ProfileTabs 
        profile={profile} 
        tierInfo={tierInfo} 
        activities={activities} 
        isEditing={isEditing} 
        editForm={editForm} 
        setEditForm={setEditForm} 
        parsedPrivacySettings={parsedPrivacySettings} 
      />
      <LayoutFooter />
    </div>
  )
}
`;

fs.writeFileSync(pageFile, newPageContent);
console.log('Refactoring complete for Profile page!');
