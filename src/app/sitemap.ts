import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const postUrls = (posts || []).map(post => ({
    url: `https://tadavibes.com/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://tadavibes.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://tadavibes.com/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://tadavibes.com/vibes', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://tadavibes.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...postUrls,
  ]
}
