import { PageComponentType } from "@/app/__types/PageComponentType";
import { v4 as uuidv4 } from "uuid";
import { META_QUERY_KEY, UpdatePageMetaProps, UpdatePageRowColMetaProps } from "./metaHooks";
import { api } from "@/axiosConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { DMGTypeComponent } from "@/components/_base/DynamicMetaGrid/DMG";

export type DeleteComponentProps =
  UpdatePageMetaProps &
  UpdatePageRowColMetaProps & {
    componentId: UUID;
  }

export type UpdateComponentMetaProps =
  UpdatePageMetaProps &
  UpdatePageRowColMetaProps & {
    componentId: UUID;
    patch: DMGTypeComponent;
  }

export type ReorderComponentMetaProps =
  UpdatePageMetaProps &
  UpdatePageRowColMetaProps & {
    componentId: UUID;
    ordinal: number;
  }

export const blankComponentTemplate =
  (ordinal: number, type?: PageComponentType, reference?: UUID) => ({
    id: uuidv4() as UUID,
    ordinal: ordinal,
    reference: reference || null,
    type,
    className: '',
    title: '',
    content: '',
  })

export async function postComponentMeta({
  _id,
  colId,
  rowId,
  patch,
}: UpdateComponentMetaProps): Promise<DMGTypeComponent | null> {
  return api.post(`/meta/${_id}/${colId !== undefined ? 'columns' : 'rows'}/${colId !== undefined ? colId : rowId}/components/`, patch)
}

export async function putComponentMeta({
  _id,
  colId,
  rowId,
  componentId,
  patch
}: UpdateComponentMetaProps): Promise<DMGTypeComponent | null> {
  return api.put(`/meta/${_id}/${colId !== undefined ? 'columns' : 'rows'}/${colId !== undefined ? colId : rowId}/components/${componentId}`, patch)
}

export function useCreateComponentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postComponentMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: META_QUERY_KEY })
    },
  })
}

export function useUpdateComponentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: putComponentMeta,
    // optimistic
    onSettled: () => queryClient.invalidateQueries({ queryKey: META_QUERY_KEY }),
  })
}

export async function putComponentReorder({
  _id,
  colId,
  rowId,
  componentId,
  ordinal,
}: ReorderComponentMetaProps): Promise<void> {
  return api.put(`/meta/${_id}/${colId !== undefined ? 'columns' : 'rows'}/${colId !== undefined ? colId : rowId}/components/${componentId}/reorder/${ordinal}`)
}

export function useReorderComponentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: putComponentReorder,
    onSettled: () => queryClient.invalidateQueries({ queryKey: META_QUERY_KEY }),
  })
}

export async function deleteComponent({
  _id,
  colId,
  rowId,
  componentId,
}: DeleteComponentProps): Promise<void> {
  return api.delete(`/meta/${_id}/${colId !== undefined ? 'columns' : 'rows'}/${colId !== undefined ? colId : rowId}/components/${componentId}`)
}

export function useDeleteComponentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteComponent,
    onSettled: () => queryClient.invalidateQueries({ queryKey: META_QUERY_KEY }),
  })
}

