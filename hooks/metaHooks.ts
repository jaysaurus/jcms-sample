import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/axiosConfig'
import { v4 as uuidv4 } from "uuid";
import { ComponentContainer, DMGType, DMGTypeColumn, DMGTypeComponent, DMGTypeRowSM } from '@/components/_base/DynamicMetaGrid/DMG';
import { UUID } from 'crypto';
import { PageComponentType } from '@/app/__types/PageComponentType';
import { blankComponentTemplate } from './componentHooks';
import { PartitionOf12 } from '@/app/__types/TwelvePtColSpan';

export type ReorderPageMetaProps = {
  _id: UUID;
  ordinal: number;
}

export type ReorderColumnMetaProps =
  UpdatePageMetaRowProps &
  ReorderPageMetaProps & {
    colId?: UUID;
  }

export type UpdatePageMetaProps = {
  _id?: UUID;
  patch?: Partial<Omit<DMGType, 'id'>>;
}

export type UpdatePageMetaRowProps = UpdatePageMetaProps & {
  rowId?: UUID
}

export type CreatePageMetaProps = {
  _id?: UUID;
  patch?: Partial<Omit<DMGType, 'id'>>;
}

export type UpdatePageRowColMetaProps = UpdatePageMetaRowProps & {
  colId?: UUID;
  patch?: Partial<Omit<DMGTypeColumn, 'id'>>;
}

export const DEFAULT_COLUMN_HEIGHT = 512
export const SITE_MAX_WIDTH = 1440
export const SNAP = 32
export const HEIGHT_SNAP = 16

export const blankColumnTemplate = (ordinal: number): DMGTypeColumn => ({
  id: uuidv4() as UUID,
  ordinal: ordinal,
  hideOnMd: false,
  hideOnLgAndUp: false,
  components: Array.from(
    Array(3)).map((_, i) =>
      blankComponentTemplate(i, PageComponentType.Default)) as DMGTypeComponent[]
})

export const blankRowSMTemplate = (ordinal: number) => {
  return {
    id: uuidv4() as UUID,
    ordinal,
    sixPtColSpan: '6',
    components: [blankComponentTemplate(0, PageComponentType.Default)],
  }
}

async function fetchPageMetas({ slug }: { slug?: string } = {}): Promise<DMGType[]> {
  const { data } = await api.get('/meta', { params: { slug } })
  return data as DMGType[]
}

async function putPageMeta({ _id, patch }: UpdatePageMetaProps): Promise<DMGType | null> {
  if (_id && patch) {
    const { data } = await api.put(`/meta/${_id}`, patch)
    return data as DMGType
  } else return null
}

async function postPageMeta({ ordinal, slug }: { ordinal: number, slug: string }): Promise<DMGType> {
  const { data } = await api.post('/meta', {
    href: window.location.pathname,
    slug,
    ordinal,
    twelvePtColSpan: '3-3-3-3' as PartitionOf12,
    [ComponentContainer.Column]: Array.from(Array(4)).map((_, i: number) => blankColumnTemplate(i)) as DMGTypeColumn[],
    [ComponentContainer.Row]: Array.from(Array(4)).map((_, i: number) => blankRowSMTemplate(i)) as DMGTypeRowSM[],
  } as DMGType)
  return data as DMGType
}

async function deletePageMeta({ _id }: UpdatePageMetaProps): Promise<void> {
  if (_id) {
    await api.delete(`/meta/${_id}`)
  }
}

async function reorderPageMeta({ _id, ordinal }: ReorderPageMetaProps): Promise<DMGType> {
  const { data } = await api.put(`/meta/${_id}/reorder/${ordinal}`)
  return data as DMGType
}

async function postPageMetaRow({ _id, patch }: UpdatePageMetaRowProps): Promise<DMGTypeRowSM | null> {
  if (_id && patch) {
    const { data } = await api.post(`/meta/${_id}/rows`, patch)
    return data as DMGTypeRowSM
  } else return null
}

async function putPageMetaRow({ _id, rowId, patch }: UpdatePageMetaRowProps): Promise<DMGTypeRowSM | null> {
  if (_id && patch) {
    const { data } = await api.put(`/meta/${_id}/rows/${rowId}`, patch)
    return data as DMGTypeRowSM
  } else return null
}

async function reorderColumnMeta({ _id, colId, rowId, ordinal }: ReorderColumnMetaProps): Promise<DMGType> {
  const { data } = await api.put(
    `/meta/${_id}/${colId !== undefined ? 'columns' : 'rows'}/${colId !== undefined ? colId : rowId}/reorder/${ordinal}`)
  return data as DMGType
}

export const META_QUERY_KEY = ['meta'] as const

export function usePageMetasQuery({ slug }: { slug?: string } = {}) {
  return useQuery({
    queryKey: slug ? [...META_QUERY_KEY, slug] : META_QUERY_KEY,
    queryFn: () => fetchPageMetas({ slug }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

function getAllCachedMetas(queryClient: ReturnType<typeof useQueryClient>): DMGType[] {
  return queryClient.getQueriesData<DMGType[]>({ queryKey: META_QUERY_KEY })
    .flatMap(([, data]) => data ?? [])
}

export function getCachedMetaById({ _id }: { _id: UUID }) {
  const queryClient = useQueryClient()

  return getAllCachedMetas(queryClient)
    .find(it => it._id === _id) || null
}


export const useGetCachedMetaByColumnId = () => {
  const queryClient = useQueryClient()

  return {
    getCachedMetaByColumnId: (id: UUID) => {
      return getAllCachedMetas(queryClient)
        .find(meta => meta[ComponentContainer.Column].find(column => column.id === id))
    }
  }
}

export const useGetCachedMetaByRowId = () => {
  const queryClient = useQueryClient()

  return {
    getCachedMetaByRowId: (id: UUID) => {
      return getAllCachedMetas(queryClient)
        .find(meta => meta[ComponentContainer.Row].find(row => row.id === id))
    }
  }
}

export const useGetCachedMetaByComponentId = () => {
  const queryClient = useQueryClient()

  return {
    getCachedMetaByComponentId: (id: UUID, type: ComponentContainer = ComponentContainer.Column) => {
      return getAllCachedMetas(queryClient)
        .find(meta => meta[type].find(t => t.components.find(it => it.id === id)))
    }
  }
}

export function useUpdatePageMetaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: putPageMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useUpdatePageMetaRowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: putPageMetaRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useCreatePageMetaRowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postPageMetaRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useCreatePageMetaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postPageMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useDeletePageMetaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePageMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useReorderPageMetaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderPageMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useReorderFieldMetaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderColumnMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

