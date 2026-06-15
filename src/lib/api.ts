export const getApiUrl = (): string => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/inquiry/submit'
    : '/api/inquiry/submit';
};
