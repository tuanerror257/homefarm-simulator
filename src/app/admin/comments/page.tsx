import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApproveButton from '@/components/ApproveButton'
import DeleteButton from '@/components/DeleteButton'
import Footer from '@/components/Footer'

export default async function AdminCommentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch all comments with post info
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      approved,
      author_name,
      author_email,
      posts (
        id,
        title,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  const pendingComments = comments?.filter((c) => !c.approved) || []
  const approvedComments = comments?.filter((c) => c.approved) || []

  // Fetch categories for footer
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-red-600 font-bold text-xl">
              Tadavibes
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">Quản lý bình luận</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/admin" className="text-gray-500 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/admin/posts" className="text-gray-500 hover:text-gray-900">
              Bài viết
            </a>
            <a href="/admin/comments" className="text-red-600 font-medium">
              Bình luận
            </a>
            <a href="/admin/categories" className="text-gray-500 hover:text-gray-900">
              Danh mục
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Pending comments */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Chờ duyệt
              {pendingComments.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingComments.length}
                </span>
              )}
            </h2>
          </div>

          {pendingComments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Không có bình luận nào đang chờ duyệt
            </div>
          ) : (
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl border border-orange-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.author_name || 'Ẩn danh'}
                        </span>
                        {comment.author_email && (
                          <span className="text-gray-400 text-xs">
                            {comment.author_email}
                          </span>
                        )}
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(comment.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                      {comment.posts && (
                        <a
                          href={`/blog/${(comment.posts as any).slug}`}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Bài: {(comment.posts as any).title}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ApproveButton commentId={comment.id} />
                      <DeleteButton commentId={comment.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved comments */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Đã duyệt
            <span className="ml-2 text-gray-400 text-sm font-normal">
              ({approvedComments.length})
            </span>
          </h2>

          {approvedComments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Chưa có bình luận nào được duyệt
            </div>
          ) : (
            <div className="space-y-3">
              {approvedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.author_name || 'Ẩn danh'}
                        </span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(comment.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-green-500 text-xs">✓ Đã duyệt</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{comment.content}</p>
                      {comment.posts && (
                        <a
                          href={`/blog/${(comment.posts as any).slug}`}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Bài: {(comment.posts as any).title}
                        </a>
                      )}
                    </div>
                    <div className="shrink-0">
                      <DeleteButton commentId={comment.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer categories={categories || []} />
    </div>
  )
}
