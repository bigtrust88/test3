/**
 * useAuth Hook
 * JWT 토큰 관리 및 인증 상태 추적
 */

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;

    // localStorage에서 JWT 확인
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);

    if (token) {
      try {
        // JWT Decode (base64 decode, 검증 없음)
        // 실제로는 backend에서 토큰 검증이 필요함
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join(''),
        );
        const decoded = JSON.parse(jsonPayload);

        setState({
          user: decoded.user || null,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // 토큰 파싱 실패
        localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  return state;
}
