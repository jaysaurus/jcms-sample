import { useMediaQuery } from "@uidotdev/usehooks";

export enum MediaSizes {
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  XL2 = 1536,
}

// export const isSmallDevice = useMediaQuery(
//   `only screen and (max-width : ${MediaSizes.MD - 1}px)`
// )

// export const isMediumDevice = useMediaQuery(
//   `only screen and (min-width : ${MediaSizes.MD}px) and (max-width : ${MediaSizes.LG - 1}px)`
// )

// export const isLargeDevice = useMediaQuery(
//   `only screen and (min-width : ${MediaSizes.LG}px) and (max-width : ${MediaSizes.XL - 1}px)`
// )

// export const isExtraLargeDevice = useMediaQuery(
//   `only screen and (min-width : ${MediaSizes.XL}px)`
// )