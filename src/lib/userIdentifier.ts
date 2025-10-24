// 4자리 숫자 시리얼 넘버 생성
export const generateUserIdentifier = (): string => {
  const number = Math.floor(Math.random() * 10000);
  return number.toString().padStart(4, '0');
};

// localStorage에서 시리얼 넘버 가져오기
export const getUserIdentifier = (): string | null => {
  return localStorage.getItem('user_identifier');
};

// localStorage에 시리얼 넘버 저장
export const setUserIdentifier = (identifier: string): void => {
  localStorage.setItem('user_identifier', identifier);
};

// 시리얼 넘버 유효성 검사 (4자리 숫자)
export const isValidUserIdentifier = (identifier: string): boolean => {
  return /^[0-9]{4}$/.test(identifier);
};

// 시리얼 넘버 포맷팅 (4자리)
export const formatUserIdentifier = (identifier: string): string => {
  return identifier;
};
