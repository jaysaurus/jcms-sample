import { PageComponentType } from "@/app/__types/PageComponentType";
import { PartitionOf12, PartitionOf6 } from "@/app/__types/TwelvePtColSpan";
import { UUID } from "crypto";
import { atom } from "jotai";
import { v4 as uuid } from "uuid"

export const ComponentReferenceAtom = atom<null | UUID>(null)

export type DMGTypeComponent = {
  id?: UUID;
  reference?: UUID | null;
  type?: PageComponentType;
  ordinal?: number;
  height?: number;
  isReference?: boolean;
  title?: string;
  content?: string;
  className?: string;
  hideOnMd?: boolean;
  hideOnLgAndUp?: boolean;
  items?: any | null;
}

export type DMGTypeColumn = {
  id?: UUID;
  ordinal: number;
  hideOnMd: boolean;
  hideOnLgAndUp: boolean;
  components: DMGTypeComponent[];
}

export type DMGTypeRowSM = {
  id?: UUID;
  ordinal: number;
  sixPtColSpan: PartitionOf6;
  components: DMGTypeComponent[];
}

export enum ComponentContainer {
  Column = 'columns',
  Row = 'rowsSM',
}

export type DMGType = {
  _id?: UUID;
  slug?: string;
  ordinal?: number;
  backgroundImgSrc?: string;
  backgroundImgSrcSM?: string;
  twelvePtColSpan?: PartitionOf12;
  [ComponentContainer.Column]: DMGTypeColumn[];
  [ComponentContainer.Row]: DMGTypeRowSM[];
}

export const RAW_DMG_COLUMN_COMPONENT = {
  type: PageComponentType.Default,
}

export const RAW_DMG_COLUMN = {
  id: uuid(),
  components: [
    RAW_DMG_COLUMN_COMPONENT,
  ],
}
