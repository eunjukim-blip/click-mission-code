// 24자리 시리얼 넘버 생성
export const generateUserIdentifier = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// localStorage에서 시리얼 넘버 가져오기
export const getUserIdentifier = (): string | null => {
  return localStorage.getItem('user_identifier');
};

// localStorage에 시리얼 넘버 저장
export const setUserIdentifier = (identifier: string): void => {
  localStorage.setItem('user_identifier', identifier);
};

// 시리얼 넘버 유효성 검사 (24자리 영문 대문자 + 숫자)
export const isValidUserIdentifier = (identifier: string): boolean => {
  return /^[A-Z0-9]{24}$/.test(identifier);
};

// 시리얼 넘버 포맷팅 (6-6-6-6)
export const formatUserIdentifier = (identifier: string): string => {
  if (identifier.length !== 24) return identifier;
  return `${identifier.slice(0, 6)}-${identifier.slice(6, 12)}-${identifier.slice(12, 18)}-${identifier.slice(18, 24)}`;
};
