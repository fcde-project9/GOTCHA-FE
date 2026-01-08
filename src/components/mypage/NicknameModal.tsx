"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onClose: () => void;
  onSave: (newNickname: string) => void;
}

/**
 * 닉네임 변경 모달 컴포넌트
 *
 * 규칙:
 * - 특수문자 사용 불가능
 * - 2글자 이상 12글자까지만 가능
 * - 중복 닉네임 불가
 */
export function NicknameModal({ isOpen, currentNickname, onClose, onSave }: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const validateNickname = (value: string): string | null => {
    // 빈 값 체크
    if (!value || value.trim() === "") {
      return "";
    }

    // 길이 체크 (2자 미만)
    if (value.length < 2) {
      return "2자 이상 입력해주세요";
    }

    // 길이 체크 (12자 초과)
    if (value.length > 12) {
      return "12자 이하로 입력해주세요";
    }

    // 특수문자 체크 (한글 완성형, 자음, 모음, 영문, 숫자만 허용)
    const specialCharRegex = /[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/;
    if (specialCharRegex.test(value)) {
      return "특수문자는 사용할 수 없습니다";
    }

    return null;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);

    const validationError = validateNickname(value);
    setError(validationError || "");
  };

  const handleSave = async () => {
    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    // TODO: 백엔드 API 연동 - 중복 닉네임 체크
    // const isDuplicate = await checkNicknameDuplicate(nickname);
    // if (isDuplicate) {
    //   setError("중복된 닉네임입니다");
    //   return;
    // }

    // TODO: 백엔드 API 연동 - 닉네임 변경
    // await apiClient.patch('/user/nickname', { nickname });
    onSave(nickname);
    onClose();
  };

  const isButtonDisabled = !nickname || nickname.trim() === "" || !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            닉네임 변경
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center"
            aria-label="닫기"
          >
            <X size={24} className="stroke-grey-700" strokeWidth={2} />
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder={currentNickname}
            maxLength={12}
            className={`w-full h-12 px-4 rounded-lg border ${
              error ? "border-main-500" : "border-line-100"
            } text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900 placeholder:text-grey-400 focus:outline-none ${
              error ? "focus:border-main-500" : "focus:border-line-100"
            }`}
          />
          {error ? (
            <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-main-500">
              {error}
            </p>
          ) : (
            <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-400">
              2자 이상 입력해주세요
            </p>
          )}
        </div>

        {/* Guide */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-semibold leading-[1.5] tracking-[-0.12px] text-grey-900">
            닉네임 등록 및 사용안내
          </p>
          <ul className="flex flex-col gap-0.5">
            <li className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-500 before:content-['•'] before:mr-1">
              욕설/비속어의 댓 생성/차별/비방은 표절이 안이
            </li>
            <li className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-500 before:content-['•'] before:mr-1">
              타사의 브랜드 및 제품명을 포함한 단어
            </li>
            <li className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-500 before:content-['•'] before:mr-1">
              기타, 사회적 및 통념에 어긋나는 단어 등
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isButtonDisabled}
            className="flex-1 h-12 rounded-lg bg-grey-900 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white disabled:bg-grey-300 disabled:text-grey-500"
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
}
