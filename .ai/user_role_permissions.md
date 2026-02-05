# 사용자 역할별 권한 (User Role Permissions)

## 역할 유형 (UserType)

```typescript
type UserType = "ADMIN" | "OWNER" | "NORMAL";
```

- **ADMIN**: 관리자 - 가게 수정/삭제, 타인 리뷰 삭제 권한
- **OWNER**: 업주 - 향후 확장용 (현재 NORMAL과 동일)
- **NORMAL**: 일반 사용자

## 권한 매트릭스

| 기능                  | 비로그인 | 일반 유저 | ADMIN |
| --------------------- | :------: | :-------: | :---: |
| **가게**              |          |           |       |
| 가게 조회             |    ✅    |    ✅     |  ✅   |
| 가게 찜하기           |    ❌    |    ✅     |  ✅   |
| 가게 공유하기         |    ✅    |    ✅     |  ✅   |
| 가게 정보 수정        |    ❌    |    ❌     |  ✅   |
| 가게 대표 이미지 수정 |    ❌    |    ❌     |  ✅   |
| 가게 삭제             |    ❌    |    ❌     |  ✅   |
| **리뷰**              |          |           |       |
| 리뷰 조회             |    ✅    |    ✅     |  ✅   |
| 리뷰 작성             |    ❌    |    ✅     |  ✅   |
| 리뷰 좋아요           |    ❌    |    ✅     |  ✅   |
| 내 리뷰 수정          |    -     |    ✅     |  ✅   |
| 내 리뷰 삭제          |    -     |    ✅     |  ✅   |
| 타인 리뷰 수정        |    ❌    |    ❌     |  ❌   |
| 타인 리뷰 삭제        |    ❌    |    ❌     |  ✅   |
| **마이페이지**        |          |           |       |
| ADMIN 배지 표시       |    -     |    ❌     |  ✅   |

## 권한 확인 방법

```typescript
// useUser 훅에서 isAdmin 제공
const { isAdmin } = useUser();

// 리뷰 권한 확인 예시
const canEditReview = review.isOwner; // 본인만 수정 가능
const canDeleteReview = review.isOwner || isAdmin; // 본인 또는 ADMIN
```

## 관련 파일

- 타입 정의: `src/api/types.ts` (UserType, User)
- 권한 훅: `src/api/queries/useUser.ts` (isAdmin)
- 가게 수정: `src/components/features/shop/ShopEditModal.tsx`
- 가게 삭제: `src/components/features/shop/ShopDeleteConfirmModal.tsx`
- 어드민 메뉴: `src/app/shop/[id]/page.tsx`, `src/components/features/shop/ShopPreviewBottomSheet.tsx`
