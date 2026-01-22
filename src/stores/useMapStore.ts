import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MapState {
  /** 지도 중심 좌표 */
  mapCenter: { latitude: number; longitude: number } | null;
  /** 지도 줌 레벨 */
  mapLevel: number;
  /** 검색어 */
  searchQuery: string;
  /** 지도 중심 설정 */
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
  /** 지도 줌 레벨 설정 */
  setMapLevel: (level: number) => void;
  /** 검색어 설정 */
  setSearchQuery: (query: string) => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState = {
  mapCenter: null,
  mapLevel: 5,
  searchQuery: "",
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      ...initialState,
      setMapCenter: (center) => set({ mapCenter: center }),
      setMapLevel: (level) => set({ mapLevel: level }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      reset: () => set(initialState),
    }),
    {
      name: "map-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
