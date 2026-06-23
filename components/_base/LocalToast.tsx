import { mdiAlertOutline, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCrossOutline, mdiInformationOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { UUID } from "crypto";
import first from "lodash/first";
import { Toast, ToastMessage, ToastPassThroughMethodOptions, ToastProps } from "primereact/toast";
import { createContext, ReactNode, Ref, RefObject, useContext, useRef } from "react";
import { createPortal } from "react-dom";

export type LocalToastType = ToastProps & {
  ref: Ref<Toast>;
}

type Severity = "success" | "error" | "warn" | "info" | "secondary" | "contrast" | undefined

export type LocalToastMessageProps = {
  toast: RefObject<Toast | null>,
  message: string,
  severity: Severity,
  life?: number,
  id?: string,
}

const SEVERITY_BG_VAR: Record<string, string> = {
  success: '--success',
  error: '--error',
  warn: '--warning',
  info: '--info',
}

const SEVERITY_TEXT_CLASS: Record<string, string> = {
  success: 'text-successDark',
  error: 'text-errorDark',
  warn: 'text-warningDark',
  info: 'text-infoDark',
}

const contentOptions = (options: ToastPassThroughMethodOptions) => {
  return ({
    className: [
      'font-bold',
      'mb-3',
    ].join(' ')
  })
}

export default function LocalToast({ ref, ...t }: LocalToastType) {
  try {
    return createPortal(
      <Toast
        ref={ref}
        {...t}
        pt={{
          root: { className: 'transition-all' },
          text: { className: 'text-white!' },
          content: contentOptions,
          closeButton: { className: 'absolute right-6 top-2' }
        }}
      />,
      document.body
    )
  } catch (_) {
    return <></>
  }
}

export function showLocalToast({ toast, message, id, severity, life = 5000 }: LocalToastMessageProps) {
  const getIconPath = (severity: LocalToastMessageProps["severity"]) => {
    switch (severity) {
      case 'success':
        return mdiCheckCircleOutline
      case 'error':
        return mdiCloseCircleOutline
      case 'warn':
        return mdiAlertOutline
      default:
        return mdiInformationOutline
    }
  }

  const contentText = [
    'flex',
    'font-bold',
    'items-center',
    'p-5',
    'w-full',
    severity ? SEVERITY_TEXT_CLASS[severity] : '',
  ].join(' ')

  toast?.current?.show({
    severity,
    life,
    refId: id,
    content: () => (
      <div className={contentText}
        style={{
          backgroundColor: `color-mix(in srgb, var(${SEVERITY_BG_VAR[severity!]}) 20%, transparent)`,
          backdropFilter: 'blur(.4rem)',
          WebkitBackdropFilter: 'blur(.5rem)',
          boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(${SEVERITY_BG_VAR[severity!]}) 50%, transparent)`,
        }}
      >
        {/*  */}
        < Icon
          className="mr-5"
          path={getIconPath(severity)} size={1.5}
        />&nbsp;
        <div>
          {message}
        </div>
      </div >
    ),
  } as unknown as ToastMessage);
}

const LocalToastContext = createContext<RefObject<Toast | null> | null>(null)

export function LocalToastProvider({ children }: { children: ReactNode }) {
  const toast = useRef<Toast>(null)

  return (
    <LocalToastContext.Provider value={toast}>
      <LocalToast ref={toast} position="top-right" />
      {children}
    </LocalToastContext.Provider>
  )
}

export function useShowLocalToast() {
  const toast = useContext(LocalToastContext)

  return (props: Omit<LocalToastMessageProps, 'toast'>) => {
    if (toast) {
      showLocalToast({ toast, ...props })
    }
  }
}
