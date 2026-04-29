export type Tag = 'Kinh Doanh' | 'AI / Tech' | 'Lifestyle'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  tag: Tag
  thumbnail_url: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Vibe {
  id: string
  text: string
  published: boolean
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  body: string
  approved: boolean
  created_at: string
}

export interface Reaction {
  id: string
  post_id: string
  type: 'heart' | 'fire' | 'think'
  created_at: string
}
