import type { RouteLocationNormalized } from 'vue-router'

const ensure_name_meta = (name: string): HTMLMetaElement => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  return tag
}

const ensure_prop_meta = (property: string): HTMLMetaElement => {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  return tag
}

const ensure_canonical_link = (): HTMLLinkElement => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  return link
}

export const apply_seo = (to: RouteLocationNormalized) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const path = to.path || '/'
  const canonical_url = (to.meta?.canonical as string) || `${origin}${path}`

  const default_title = 'Spyfall Online | Play Spyfall Free with Friends'
  const default_description = 'Play Spyfall online for free. Create a room, invite friends, and enjoy a fast social deduction party game.'
  const default_image = `${origin}/images/spyfall_logo.jpg`
  const default_robots = 'index, follow'

  const title = (to.meta?.title as string) || default_title
  const description = (to.meta?.description as string) || default_description
  const keywords = to.meta?.keywords as string | string[] | undefined
  const robots = (to.meta?.robots as string) || default_robots
  const og_image = (to.meta?.og_image as string) || default_image

  document.title = title

  ensure_name_meta('description').setAttribute('content', description)
  if (keywords) {
    const value = Array.isArray(keywords) ? keywords.join(', ') : keywords
    ensure_name_meta('keywords').setAttribute('content', value)
  }
  ensure_name_meta('robots').setAttribute('content', robots)

  const canonical_link = ensure_canonical_link()
  canonical_link.setAttribute('href', canonical_url)

  ensure_prop_meta('og:type').setAttribute('content', 'website')
  ensure_prop_meta('og:title').setAttribute('content', title)
  ensure_prop_meta('og:description').setAttribute('content', description)
  ensure_prop_meta('og:url').setAttribute('content', canonical_url)
  ensure_prop_meta('og:image').setAttribute('content', og_image)

  ensure_prop_meta('twitter:card').setAttribute('content', 'summary_large_image')
  ensure_prop_meta('twitter:title').setAttribute('content', title)
  ensure_prop_meta('twitter:description').setAttribute('content', description)
  ensure_prop_meta('twitter:image').setAttribute('content', og_image)
}


