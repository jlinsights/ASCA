import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ProfileEditClient } from '../profile-edit-client'
import { fetchArtistProfile, updateArtistProfile } from '@/lib/api/profiles'
import { useAccount } from '@/components/auth/session-provider'
import { profileEditorTranslations } from '@/lib/i18n/translations/profile-editor'

const mockRouter = { replace: jest.fn() }
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }))
jest.mock('@/components/auth/session-provider', () => ({ useAccount: jest.fn() }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/lib/api/profiles', () => ({
  fetchArtistProfile: jest.fn(),
  updateArtistProfile: jest.fn(),
}))

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const profile = {
  id,
  name: '작가',
  nameEn: 'Artist',
  bio: '소개',
  bioEn: 'Biography',
  birthYear: 1970,
  specialization: ['해서'],
  profileImage: null,
  visibility: 'hidden' as const,
}
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccount).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { id: 'account-uuid', artistIds: [id] },
  } as any)
  jest.mocked(fetchArtistProfile).mockResolvedValue({ data: profile, error: null })
  jest.mocked(updateArtistProfile).mockResolvedValue({ data: profile, error: null })
})

it('loads the artist UUID and saves only supported fields, including clearing birth year', async () => {
  render(<ProfileEditClient />)
  const name = await screen.findByLabelText('profileEditorNameEn')
  expect(name).toHaveValue('Artist')
  expect(fetchArtistProfile).toHaveBeenCalledWith(id)
  fireEvent.change(name, { target: { value: 'Updated' } })
  fireEvent.change(screen.getByLabelText('profileEditorBirth'), { target: { value: '' } })
  fireEvent.change(screen.getByLabelText('profileEditorSpecialties'), {
    target: { value: '해서, 행서,' },
  })
  expect(screen.getByLabelText('profileEditorSpecialties')).toHaveValue('해서, 행서,')
  fireEvent.submit(screen.getByRole('button', { name: 'authNativeSave' }).closest('form')!)
  await waitFor(() =>
    expect(updateArtistProfile).toHaveBeenCalledWith(id, {
      nameEn: 'Updated',
      bio: '소개',
      bioEn: 'Biography',
      birthYear: null,
      specialization: ['해서', '행서'],
    })
  )
  expect(await screen.findByRole('status')).toHaveTextContent('profileEditorSaved')
  expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  expect(screen.getByText('profileEditorHidden')).toBeInTheDocument()
  expect(screen.getByLabelText('profileEditorName')).toHaveAttribute('readonly')
})

it('shows save failures and never reports success', async () => {
  jest
    .mocked(updateArtistProfile)
    .mockResolvedValue({ data: null, error: { message: 'Rejected', code: 'FORBIDDEN' } })
  render(<ProfileEditClient />)
  await screen.findByLabelText('profileEditorName')
  fireEvent.submit(screen.getByRole('button', { name: 'authNativeSave' }).closest('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('authNativeUnavailable')
  expect(screen.queryByText('profileEditorSaved')).not.toBeInTheDocument()
})

it('does not invent or edit an artist when the account is unlinked', async () => {
  jest.mocked(useAccount).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { id: 'account-uuid', artistIds: [] },
  } as any)
  render(<ProfileEditClient />)
  expect(await screen.findByText('authNativeUnlinked')).toBeInTheDocument()
  expect(fetchArtistProfile).not.toHaveBeenCalled()
  expect(updateArtistProfile).not.toHaveBeenCalled()
})

it('leaves the editor and shows the unlinked state when ownership is removed', async () => {
  const { rerender } = render(<ProfileEditClient />)
  await screen.findByLabelText('profileEditorName')
  jest.mocked(useAccount).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { id: 'account-uuid', artistIds: [] },
  } as any)
  rerender(<ProfileEditClient />)
  expect(await screen.findByText('authNativeUnlinked')).toBeInTheDocument()
  expect(screen.queryByLabelText('profileEditorName')).not.toBeInTheDocument()
  expect(updateArtistProfile).not.toHaveBeenCalled()
})

it('does not present an empty editable form when loading fails', async () => {
  jest
    .mocked(fetchArtistProfile)
    .mockResolvedValue({ data: null, error: { message: 'Unavailable' } })
  render(<ProfileEditClient />)
  expect(await screen.findByRole('alert')).toHaveTextContent('profileEditorLoadError')
  expect(screen.queryByRole('button', { name: 'authNativeSave' })).not.toBeInTheDocument()
})

it('provides the same editor translation keys in all supported languages', () => {
  const expected = Object.keys(profileEditorTranslations.ko).sort()
  for (const values of Object.values(profileEditorTranslations)) {
    expect(Object.keys(values).sort()).toEqual(expected)
    expect(Object.values(values).every(value => value.trim().length > 0)).toBe(true)
  }
})

it('ignores an old save response after the linked account and artist change', async () => {
  let finishOldSave!: (value: { data: typeof profile; error: null }) => void
  jest.mocked(updateArtistProfile).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finishOldSave = resolve
      })
  )
  const { rerender } = render(<ProfileEditClient />)
  await screen.findByLabelText('profileEditorName')
  fireEvent.submit(screen.getByRole('button', { name: 'authNativeSave' }).closest('form')!)
  await waitFor(() => expect(updateArtistProfile).toHaveBeenCalledTimes(1))
  const next = { ...profile, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: '다른 작가' }
  jest.mocked(useAccount).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { id: 'new-account', artistIds: [next.id] },
  } as any)
  jest.mocked(fetchArtistProfile).mockResolvedValue({ data: next, error: null })
  rerender(<ProfileEditClient />)
  await waitFor(() => expect(screen.getByLabelText('profileEditorName')).toHaveValue('다른 작가'))
  await act(async () => {
    finishOldSave({ data: { ...profile, name: '늦게 저장된 이름' }, error: null })
  })
  expect(screen.getByLabelText('profileEditorName')).toHaveValue('다른 작가')
  expect(screen.queryByText('profileEditorSaved')).not.toBeInTheDocument()
  jest.mocked(updateArtistProfile).mockResolvedValue({ data: next, error: null })
  fireEvent.submit(screen.getByRole('button', { name: 'authNativeSave' }).closest('form')!)
  await waitFor(() =>
    expect(updateArtistProfile).toHaveBeenLastCalledWith(
      next.id,
      expect.objectContaining({ nameEn: 'Artist' })
    )
  )
  expect(jest.mocked(updateArtistProfile).mock.calls.at(-1)?.[1]).not.toHaveProperty('name')
})
