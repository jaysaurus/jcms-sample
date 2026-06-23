import Icon from "@mdi/react";
import { ButtonProps } from "primereact/button";
import ConditionalComponent from "./ConditionalComponent";
import omit from "lodash/omit";
import { ariaLabel } from "primereact/api";

export type IconButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLElement>) => unknown;
  icon: string;
  buttonProps?: ButtonProps & { className?: string };
  style?: Record<string, string>;
  iconProps?: any;
  label?: string;
}

export default function IconButton({ onClick, style, icon, buttonProps, iconProps, label = undefined }: IconButtonProps) {
  const buttonClass = [
    'flex',
    'cursor-pointer',
    buttonProps?.className || '',
  ].join(' ')

  return (
    <button
      aria-label={buttonProps?.['aria-label']}
      onClick={onClick}
      {...omit(buttonProps, ['className'])}
      {...{ style }}
      className={buttonClass}
    >
      <Icon className="text-primaryLink" path={icon} {...{ size: 1, ...iconProps }} />
      <ConditionalComponent condition={!!label}>
        &nbsp;
        <div className="hover:underline text-primaryLink">
          {label}
        </div>
      </ConditionalComponent>
    </button>
  )
}