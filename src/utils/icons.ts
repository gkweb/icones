import Iconify from '@purge-icons/generated'
import { getTransformedId } from '../store'
import Base64 from './base64'
import { HtmlToJSX } from './htmlToJsx'

const API_ENTRY = 'https://api.iconify.design'

export async function getSvg(icon: string, size = '1em') {
  return Iconify.renderSVG(icon, { height: size })?.outerHTML
   || await fetch(`${API_ENTRY}/${icon}.svg?inline=false&height=${size}`).then(r => r.text()) || ''
}

export function toComponentName(icon: string) {
  return icon.split(/:|-|_/).filter(Boolean).map((s, i) => s[0].toUpperCase() + s.slice(1).toLowerCase()).join('')
}

export function ClearSvg(svgCode: string) {
  const el = document.createElement('div')
  el.innerHTML = svgCode
  const svg = el.getElementsByTagName('svg')[0]
  const keep = ['viewBox', 'width', 'height', 'focusable']
  for (const key of Object.values(svg.attributes)) {
    if (keep.includes(key.localName))
      continue
    svg.removeAttributeNode(key)
  }
  return HtmlToJSX(el.innerHTML)
}

export function SvgToJSX(svg: string, name: string, snippet: boolean) {
  const code = `
export function ${name}(props) {
  return (
    ${ClearSvg(svg).replace(/<svg (.*?)>/, '<svg $1 {...props}>')}
  )
}`
  if (snippet)
    return code
  else
    return `import React from 'react'\n${code}\nexport default ${name}`
}

export function SvgToTSX(svg: string, name: string, snippet: boolean) {
  const code = `
export function ${name}(props: SVGProps<SVGSVGElement>) {
  return (
    ${ClearSvg(svg).replace(/<svg (.*?)>/, '<svg $1 {...props}>')}
  )
}`
  if (snippet)
    return code
  else
    return `import React, { SVGProps } from 'react'\n${code}\nexport default ${name}`
}

export function SvgToVue(svg: string, name: string) {
  return `
<template>
  ${ClearSvg(svg)}
</template>

<script>
export default {
  name: '${name}'
}
</script>`
}

export function SvgToSvelte(svg: string) {
  return ClearSvg(svg)
}

export async function getIconSnippet(icon: string, type: string, snippet = true): Promise<string | undefined> {
  if (!icon)
    return

  switch (type) {
    case 'id':
      return getTransformedId(icon)
    case 'url':
      return `${API_ENTRY}/${icon}.svg`
    case 'html':
      return `<span class="iconify" data-icon="${icon}" data-inline="false"></span>`
    case 'css':
      return `background: url('${API_ENTRY}/${icon}.svg') no-repeat center center / contain;`
    case 'svg':
      return await getSvg(icon, '32')
    case 'data_url':
      return `data:image/svg+xml;base64,${Base64.encode(await getSvg(icon))}`
    case 'pure-jsx':
      return ClearSvg(await getSvg(icon))
    case 'jsx':
      return SvgToJSX(await getSvg(icon), toComponentName(icon), snippet)
    case 'tsx':
      return SvgToTSX(await getSvg(icon), toComponentName(icon), snippet)
    case 'vue':
      return SvgToVue(await getSvg(icon), toComponentName(icon))
    case 'svelte':
      return SvgToSvelte(await getSvg(icon))
  }
}

export function getIconDownloadLink(icon: string) {
  return `${API_ENTRY}/${icon}.svg?download=true&inline=false&height=auto`
}
