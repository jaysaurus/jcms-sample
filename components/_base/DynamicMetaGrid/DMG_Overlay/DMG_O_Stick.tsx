import { mdiSquare } from "@mdi/js";
import Icon from "@mdi/react";
import { Button, type ButtonProps } from "primereact/button";
import type { IconType } from "primereact/utils";
import { useEffect, useState } from "react";

type StickButtonProps = {
  icon?: IconType<ButtonProps>;
  color?: string;
  hoverColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DMG_O_Stick({
  color = 'bg-white hover:bg-accent text-gray-500 hover:text-black',
  className = '',
  ...props
}: StickButtonProps & React.ComponentProps<typeof Button>) {
  const classes = [
    'inline-flex',
    'h-3',
    'w-3',
    'items-center',
    'justify-center',
    'text-sticks',
    'transition-colors',
    'duration-150',
    color,
    className,
  ].join(' ')

  return (
    <button
      className={classes}
      pt={{ icon: { className: props.size === 'large' ? '' : '!text-xs' } }}
      {...props}
    >
      <Icon path={mdiSquare} />
    </button>
  )
}