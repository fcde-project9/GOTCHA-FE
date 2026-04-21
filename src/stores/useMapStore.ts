import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MapState {
  /** 지도 중심 좌표 */
  mapCenter: { latitude: number; longitude: number } | null;
  /** 지도 줌 레벨 */
  mapLevel: number;
  /** 검색어 */
  searchQuery: string;
  /** hydration 완료 여부 */
  hasHydrated: boolean;
  /** 지도 중심 설정 */
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
  /** 지도 줌 레벨 설정 */
  setMapLevel: (level: number) => void;
  /** 검색어 설정 */
  setSearchQuery: (query: string) => void;
  /** hydration 완료 설정 */
  setHasHydrated: (hydrated: boolean) => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState = {
  mapCenter: null as { latitude: number; longitude: number } | null,
  mapLevel: 5,
  searchQuery: "",
  hasHydrated: false,
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      ...initialState,
      setMapCenter: (center) => set({ mapCenter: center }),
      setMapLevel: (level) => set({ mapLevel: level }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      reset: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "map-storage",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // SSR 환경에서는 빈 스토리지 반환
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return sessionStorage;
      }),
      onRehydrateStorage: () => (state) => {
        // hydration 완료 시 호출
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        // hasHydrated는 저장하지 않음
        mapCenter: state.mapCenter,
        mapLevel: state.mapLevel,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
