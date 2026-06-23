import { Button, type ButtonProps } from "primereact/button";
import type { IconType } from "primereact/utils";
import { useEffect, useState } from "react";

type FabButtonProps = {
  icon: IconType<ButtonProps>;
  color?: string;
  hoverColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FabButton({
  color = 'bg-white hover:bg-accent text-gray-500 hover:text-black',
  className = '',
  ...props
}: FabButtonProps & React.ComponentProps<typeof Button>) {
  const classes = [
    'inline-flex',
    props.size === 'large' ? 'h-25' : 'h-6',
    props.size === 'large' ? 'w-25' : 'w-6',
    'items-center',
    'justify-center',
    'rounded-full',
    'text-black',
    'transition-colors',
    'duration-150',
    color,
    className,
  ].join(' ')

  return (
    <Button
      className={classes}
      pt={{
        root: {
          className: 'bg-transparent! border-0! p-0!'
        },
        icon: { className: props.size === 'large' ? '' : '!text-xs' }, ...(props.pt || {})
      }}
      {...props}
    >{props?.children}</Button>
  )
}