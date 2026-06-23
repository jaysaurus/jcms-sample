import { api } from '@/axiosConfig';
import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const isAdminAtom = atom(false)
export const isVisitorAtom = atom(false)
export const authCheckedAtom = atom(false)
export const visitorExpiryAtom = atom({ minutes: 5, seconds: 0 })

export function useAuthorise() {
  const setIsAdmin = useSetAtom(isAdminAtom)
  const setIsVisitor = useSetAtom(isVisitorAtom)
  const setAuthChecked = useSetAtom(authCheckedAtom)
  const setVisitorExpiry = useSetAtom(visitorExpiryAtom)
  useEffect(() => {
    api.get('auth/status')
      .then(({ data }) => {
        setIsAdmin(!!data?.IS_ADMIN)
        setIsVisitor(!!data?.IS_VISITOR)
        if (data.IS_VISITOR) {
          setVisitorExpiry({
            minutes: data?.EXPIRES_IN_MINUTES,
            seconds: data?.EXPIRES_IN_SECONDS,
          })
        }
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setAuthChecked(true));
  }, [setIsAdmin]);
}