import React from 'react'

interface LexicalTextNode {
  type: 'text'
  text: string
  format: number
  style?: string
}

interface LexicalElementNode {
  type: 'paragraph' | 'heading' | 'list' | 'listitem' | 'quote' | 'root'
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  listType?: 'number' | 'bullet'
  children?: LexicalNode[]
}

type LexicalNode = LexicalTextNode | LexicalElementNode

function toLexicalNode(node: Record<string, unknown> | null | undefined): LexicalNode | null {
  if (!node) return null

  const type = String(node.type || '')
  if (type === 'text') {
    return {
      type: 'text',
      text: String(node.text || ''),
      format: Number(node.format || 0),
      style: typeof node.style === 'string' ? node.style : undefined,
    }
  }

  const rawChildren = Array.isArray(node.children) ? node.children : []
  const children: LexicalNode[] = []
  for (const child of rawChildren) {
    if (typeof child === 'object' && child !== null) {
      const parsed = toLexicalNode(child as Record<string, unknown>)
      if (parsed) children.push(parsed)
    }
  }

  const validTypes = ['paragraph', 'heading', 'list', 'listitem', 'quote', 'root']
  const nodeType = validTypes.includes(type) ? (type as LexicalElementNode['type']) : 'paragraph'

  const tag = typeof node.tag === 'string' ? node.tag : undefined
  const listType = typeof node.listType === 'string' ? node.listType : undefined

  return {
    type: nodeType,
    tag: tag as LexicalElementNode['tag'],
    listType: listType as LexicalElementNode['listType'],
    children,
  }
}

export function RichText({ content }: { content: Record<string, unknown> | string | null | undefined }) {
  if (!content) return null

  if (typeof content === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  const rootNodeRecord = (typeof content === 'object' && content !== null && 'root' in content)
    ? (content.root as Record<string, unknown>)
    : content

  const rootNode = toLexicalNode(rootNodeRecord)
  if (!rootNode) return null

  const renderNode = (node: LexicalNode, index: number): React.ReactNode => {
    if (node.type === 'text') {
      let textNode: React.ReactNode = node.text || ''
      if (node.format & 1) textNode = <strong className="font-bold">{textNode}</strong>
      if (node.format & 2) textNode = <em className="italic">{textNode}</em>
      if (node.format & 4) textNode = <span className="underline">{textNode}</span>
      if (node.format & 8) textNode = <span className="line-through">{textNode}</span>
      return <React.Fragment key={index}>{textNode}</React.Fragment>
    }

    const children = node.children ? node.children.map((child, i) => renderNode(child, i)) : null

    switch (node.type) {
      case 'paragraph':
        return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{children}</p>
      case 'heading':
        const HeadingTag = node.tag || 'h3'
        const headingClasses: Record<string, string> = {
          h1: 'text-3xl font-bold text-navy-deep mt-6 mb-3',
          h2: 'text-2xl font-bold text-navy-deep mt-5 mb-2',
          h3: 'text-xl font-bold text-navy-deep mt-4 mb-2',
          h4: 'text-lg font-bold text-navy-deep mt-4 mb-1',
          h5: 'text-base font-bold text-navy-deep mt-3 mb-1',
          h6: 'text-sm font-bold text-navy-deep mt-3 mb-1',
        }
        return (
          <HeadingTag key={index} className={headingClasses[node.tag || 'h3']}>
            {children}
          </HeadingTag>
        )
      case 'list':
        if (node.listType === 'number') {
          return <ol key={index} className="list-decimal pl-6 mb-4 text-gray-700">{children}</ol>
        }
        return <ul key={index} className="list-disc pl-6 mb-4 text-gray-700">{children}</ul>
      case 'listitem':
        return <li key={index} className="mb-1">{children}</li>
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-gold-royal pl-4 italic my-4 text-gray-600">
            {children}
          </blockquote>
        )
      case 'root':
        return <div key={index}>{children}</div>
      default:
        return children ? <div key={index}>{children}</div> : null
    }
  }

  return <div className="prose prose-slate max-w-none">{renderNode(rootNode, 0)}</div>
}
