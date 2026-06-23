import { MediaSizes } from "@/libs/constants"
import { useMediaQuery } from "usehooks-ts"

export type MediaQueryProps = {
  children: React.ReactNode;
  query: {
    gte?: MediaSizes;
    lt?: MediaSizes;
  }
}

export const SMALL_DEVICE = `only screen and (max-width : ${MediaSizes.MD - 1}px)`

export default function MediaQuery({ children, query: { gte, lt } }: MediaQueryProps) {
  let queryBuilder = 'only screen'

  if (gte) queryBuilder += ` and (min-width : ${gte}px)`
  if (lt) queryBuilder += ` and (max-width : ${lt - 1}px)`

  const query = useMediaQuery(queryBuilder)
  if (query) {
    return <>{children}</>
  }

  return <></>
}