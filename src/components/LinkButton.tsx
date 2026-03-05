import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type LinkButtonTone = 'primary' | 'secondary'
type LinkButtonSize = 'sm' | 'md' | 'lg'

type LinkButtonBaseProps = {
  children: ReactNode
  className?: string
  tone?: LinkButtonTone
  size?: LinkButtonSize
}

type RouterLinkButtonProps = LinkButtonBaseProps &
  Omit<LinkProps, 'children' | 'className' | 'to'> & {
    to: LinkProps['to']
    href?: never
  }

type AnchorLinkButtonProps = LinkButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> & {
    href: string
    to?: never
  }

type LinkButtonProps = RouterLinkButtonProps | AnchorLinkButtonProps

const getClassName = (
  tone: LinkButtonTone,
  size: LinkButtonSize,
  extraClassName?: string,
) =>
  ['link-button', `link-button--${tone}`, `link-button--${size}`, extraClassName]
    .filter(Boolean)
    .join(' ')

function LinkButton(props: LinkButtonProps) {
  const {
    children,
    className,
    tone = 'secondary',
    size = 'md',
    ...restProps
  } = props

  const fullClassName = getClassName(tone, size, className)

  if ('to' in props) {
    const { to, ...linkProps } = restProps as Omit<
      RouterLinkButtonProps,
      keyof LinkButtonBaseProps
    >
    return (
      <Link className={fullClassName} to={to} {...linkProps}>
        {children}
      </Link>
    )
  }

  const { href, ...anchorProps } = restProps as Omit<
    AnchorLinkButtonProps,
    keyof LinkButtonBaseProps
  >

  return (
    <a className={fullClassName} href={href} {...anchorProps}>
      {children}
    </a>
  )
}

export default LinkButton
