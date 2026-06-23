export type ConditionalComponentProps = {
  condition: boolean;
  children: React.ReactNode;
}

// Only use on trivial components as children would always be evaluated in this component
export default function ConditionalComponent({ condition, children }: ConditionalComponentProps) {
  return condition ? <>{children}</> : <></>
}