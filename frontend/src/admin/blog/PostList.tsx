import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import type { Post } from '../../types';

interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

/**
 * Table listing all blog posts with edit / delete actions.
 * Pure presentational — no API calls.
 */
export default function PostList({ posts, onEdit, onDelete }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-gray-500">Belum ada post.</p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
          <th className="px-6 py-3">Judul</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">
        {posts.map(post => (
          <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
            <td className="px-6 py-4">
              <p className="font-medium text-white">
                {(post.title as Record<string, string>).id}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{post.slug}</p>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                  post.published
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {post.published
                  ? <><Eye className="w-3 h-3" aria-hidden="true" /> Published</>
                  : <><EyeOff className="w-3 h-3" aria-hidden="true" /> Draft</>}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(post)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                  aria-label={`Edit ${(post.title as Record<string, string>).id}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-900/20 hover:text-red-400"
                  aria-label={`Hapus ${(post.title as Record<string, string>).id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
