import { create, StateCreator } from 'zustand'
import { devtools, persist, PersistOptions } from 'zustand/middleware'

interface UIState {
  // 모달 상태
  isModalOpen: boolean
  modalType: string | null
  modalData: unknown

  // 로딩 상태
  isLoading: boolean
  loadingMessage?: string

  // 사이드바 상태
  isSidebarOpen: boolean

  // 테마 관련 상태
  isThemeTransitioning: boolean

  // 액션들
  openModal: (type: string, data?: unknown) => void
  closeModal: () => void
  setLoading: (loading: boolean, message?: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setThemeTransitioning: (transitioning: boolean) => void
}

type UIStore = StateCreator<UIState, [], [], UIState>

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        isModalOpen: false,
        modalType: null,
        modalData: null,
        isLoading: false,
        loadingMessage: undefined,
        isSidebarOpen: false,
        isThemeTransitioning: false,

        // 액션 구현
        openModal: (type: string, data?: any) => {
          set({
            isModalOpen: true,
            modalType: type,
            modalData: data,
          }, false, 'ui/openModal')
        },

        closeModal: () => {
          set({
            isModalOpen: false,
            modalType: null,
            modalData: null,
          }, false, 'ui/closeModal')
        },

        setLoading: (loading: boolean, message?: string) => {
          set({
            isLoading: loading,
            loadingMessage: message,
          }, false, 'ui/setLoading')
        },

        toggleSidebar: () => {
          const { isSidebarOpen } = get()
          set({
            isSidebarOpen: !isSidebarOpen,
          }, false, 'ui/toggleSidebar')
        },

        setSidebarOpen: (open: boolean) => {
          set({
            isSidebarOpen: open,
          }, false, 'ui/setSidebarOpen')
        },

        setThemeTransitioning: (transitioning: boolean) => {
          set({
            isThemeTransitioning: transitioning,
          }, false, 'ui/setThemeTransitioning')
        },
      }),
      {
        name: 'ui-store',
        // 특정 상태만 persist (민감하지 않은 UI 상태만)
        partialize: (state) => ({
          isSidebarOpen: state.isSidebarOpen,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
)

// 선택자 함수들 (성능 최적화를 위해)
export const useModalState = () => useUIStore((state) => ({
  isModalOpen: state.isModalOpen,
  modalType: state.modalType,
  modalData: state.modalData,
}))

export const useLoadingState = () => useUIStore((state) => ({
  isLoading: state.isLoading,
  loadingMessage: state.loadingMessage,
}))

export const useSidebarState = () => useUIStore((state) => ({
  isSidebarOpen: state.isSidebarOpen,
})) 