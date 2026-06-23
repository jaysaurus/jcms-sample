import Icon from "@mdi/react";

export type IconListItem = {
  icon: string;
  label: string;
  iconColor?: string;
}

export default function IconList({ items }: { items: IconListItem[] }) {

  return (<ul>
    {items.map(({ icon, label, iconColor = undefined }) => {
      const iconWrapperClass = ['pr-2.5']
      if (iconColor) iconWrapperClass.push('text-' + iconColor)

      return (
        <li
          key={label}
          className="flex items-center py-2"
        >
          <div className={iconWrapperClass.join(' ')}>
            <Icon size={0.75} path={icon} />
          </div>
          <div>
            {label}
          </div>
        </li>
      )
    })}
  </ul>)
}