/**
 * Button 컴포넌트 사용 예시
 *
 * 이 파일은 개발 참고용입니다.
 * 실제 프로덕션에서는 사용되지 않습니다.
 */

import { Button } from "./Button";

export function ButtonExamples() {
  return (
    <div className="p-8 space-y-12 bg-default min-h-screen">
      <h1 className="text-3xl font-bold text-grey-900">Button Component Examples</h1>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="tertiary">Tertiary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="large">Large Button</Button>
          <Button size="medium">Medium Button</Button>
          <Button size="small">Small Button</Button>
        </div>
      </section>

      {/* States - Primary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">States (Primary)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Default</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
        </div>
      </section>

      {/* States - Secondary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">States (Secondary)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Default</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" loading>
            Loading
          </Button>
        </div>
      </section>

      {/* States - Tertiary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">States (Tertiary)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="tertiary">Default</Button>
          <Button variant="tertiary" disabled>
            Disabled
          </Button>
          <Button variant="tertiary" loading>
            Loading
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Full Width</h2>
        <div className="max-w-md space-y-3">
          <Button variant="primary" fullWidth>
            Primary Full Width
          </Button>
          <Button variant="secondary" fullWidth>
            Secondary Full Width
          </Button>
          <Button variant="tertiary" fullWidth>
            Tertiary Full Width
          </Button>
        </div>
      </section>

      {/* All Sizes with All Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Size × Variant Matrix</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-grey-800">Large</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="large">
                Primary
              </Button>
              <Button variant="secondary" size="large">
                Secondary
              </Button>
              <Button variant="tertiary" size="large">
                Tertiary
              </Button>
              <Button variant="ghost" size="large">
                Ghost
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-grey-800">Medium</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="medium">
                Primary
              </Button>
              <Button variant="secondary" size="medium">
                Secondary
              </Button>
              <Button variant="tertiary" size="medium">
                Tertiary
              </Button>
              <Button variant="ghost" size="medium">
                Ghost
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-grey-800">Small</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="small">
                Primary
              </Button>
              <Button variant="secondary" size="small">
                Secondary
              </Button>
              <Button variant="tertiary" size="small">
                Tertiary
              </Button>
              <Button variant="ghost" size="small">
                Ghost
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Interactive Examples</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={() => alert("Primary 버튼 클릭!")}>
            클릭해보세요
          </Button>
          <Button variant="secondary" onClick={() => alert("Secondary 버튼 클릭!")}>
            Alert 표시
          </Button>
          <Button
            variant="tertiary"
            onClick={(e) => {
              e.preventDefault();
              alert("이벤트 처리 예시");
            }}
          >
            이벤트 처리
          </Button>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-grey-900">Real Use Cases</h2>

        {/* Form Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-grey-800">Form Actions</h3>
          <div className="flex gap-3">
            <Button variant="primary" size="large">
              확인
            </Button>
            <Button variant="tertiary" size="large">
              취소
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-grey-800">Navigation</h3>
          <Button variant="primary" size="medium" fullWidth>
            다음
          </Button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-grey-800">Actions</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="small">
              수정
            </Button>
            <Button variant="ghost" size="small">
              삭제
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
