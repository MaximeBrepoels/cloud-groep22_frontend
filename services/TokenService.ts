import jwtDecode from 'jwt-decode';

interface TokenPayload {
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: TokenPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};