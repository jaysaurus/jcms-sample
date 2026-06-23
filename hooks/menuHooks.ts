import { useMutation, useQuery, useQueryClient, type MutationFunction } from '@tanstack/react-query'
import uniqueId from 'lodash/uniqueId'
import { api } from '@/axiosConfig'
import type { MenuItem } from 'primereact/menuitem'

export type Menu = MenuItem & {
  _id?: string;
  ordinal: number;
  href: string;
  ariaLabel?: string;
}

export type ReorderMenuProps = {
  _id: string;
  ordinal: number;
}

export type UpdateMenuProps = {
  _id?: string;
  patch?: Partial<Omit<Menu, 'id'>>;
}

async function fetchMenus(): Promise<Menu[]> {
  const { data } = await api.get('/menu')
  return data as Menu[]
}

async function putMenu({ _id, patch }: UpdateMenuProps): Promise<Menu | null> {
  if (_id && patch) {
    const { data } = await api.put(`/menu/${_id}`, patch)
    return data as Menu
  } else return null
}

async function postMenu(): Promise<Menu> {
  const { data } = await api.post('/menu', {
    label: 'New Item',
    href: '/',
    public: true,
  })
  return data as Menu
}

async function deleteMenu({ _id }: UpdateMenuProps): Promise<void> {
  if (_id) {
    await api.delete(`/menu/${_id}`)
  }
}

async function reorderMenu({ _id, ordinal }: ReorderMenuProps): Promise<Menu> {
  const { data } = await api.put(`/menu/${_id}/reorder/${ordinal}`)
  return data as Menu
}


export const MENU_QUERY_KEY = ['menu'] as const

export function useMenusQuery() {
  return useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: fetchMenus,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useUpdateMenuMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: putMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useDeleteMenuMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useReorderMenuMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

