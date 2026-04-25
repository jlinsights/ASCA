/**
 * React Query hooks for Rails API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auth, members, membershipTiers, membershipApplications } from './rails-client'

/**
 * Authentication Hooks
 */

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      auth.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => auth.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.getCurrentUser(),
    enabled: auth.isAuthenticated(),
    retry: false,
  })
}

/**
 * Members Hooks
 */

export function useMembers(page = 1, status?: string) {
  return useQuery({
    queryKey: ['members', page, status],
    queryFn: () => members.list(page, status),
  })
}

export function usePendingMembers(page = 1) {
  return useQuery({
    queryKey: ['members', 'pending', page],
    queryFn: () => members.getPending(page),
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => members.get(id),
    enabled: !!id,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => members.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => members.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] })
    },
  })
}

export function useApproveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => members.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useRejectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => members.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useSuspendMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => members.suspend(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

/**
 * Membership Tiers Hooks
 */

export function useMembershipTiers() {
  return useQuery({
    queryKey: ['membershipTiers'],
    queryFn: () => membershipTiers.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMembershipTier(id: string) {
  return useQuery({
    queryKey: ['membershipTier', id],
    queryFn: () => membershipTiers.get(id),
    enabled: !!id,
  })
}

/**
 * Membership Applications Hooks
 */

export function useMembershipApplications(page = 1) {
  return useQuery({
    queryKey: ['membershipApplications', page],
    queryFn: () => membershipApplications.list(page),
  })
}

export function useMembershipApplication(id: string) {
  return useQuery({
    queryKey: ['membershipApplication', id],
    queryFn: () => membershipApplications.get(id),
    enabled: !!id,
  })
}

export function useCreateMembershipApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => membershipApplications.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipApplications'] })
    },
  })
}

export function useApproveMembershipApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      membershipApplications.approve(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipApplications'] })
    },
  })
}

export function useRejectMembershipApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      membershipApplications.reject(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipApplications'] })
    },
  })
}

export function useWithdrawMembershipApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => membershipApplications.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipApplications'] })
    },
  })
}
