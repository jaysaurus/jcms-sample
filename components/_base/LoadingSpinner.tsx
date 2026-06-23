import { mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { IconProps } from "@mdi/react/dist/IconProps";
import { useEffect, useState } from "react";

export type LoadingSpinnerProps = {
  loading: Boolean;
  stagger?: number;
  size?: number;
  label?: string;
  className?: string;
  iconProps?: Partial<Omit<IconProps, 'path'>>
};

export default function LoadingSpinner({ loading, label, stagger, size, className, iconProps }: LoadingSpinnerProps) {
  const [staggerLoad, setStaggerLoad] = useState(false)

  useEffect(() => {
    if (stagger && loading) {
      setStaggerLoad(loading as boolean)
      setTimeout(() => {
        setStaggerLoad(false)
      }, stagger)
    }
  }, [loading])

  return (stagger && staggerLoad) || loading
    ? <div {...{ className }}>
      <div className="flex items-center">
        {label ? <div className="mr-2">{label}</div> : <></>}
        <Icon
          {...iconProps}
          path={mdiLoading}
          spin={0.5}
          size={size || 1}
        />
      </div>
    </div>
    : <></>
}