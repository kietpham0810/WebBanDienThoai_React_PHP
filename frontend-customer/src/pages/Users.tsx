import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { userService } from '../services/userService';
import type { User } from '../services/userService';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [filteredList, setFilteredList] = useState<User[] | null>(null);
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    userService
      .getAll()
      .then((data) => {
        setUsers(data);
        setFilteredList(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Không tải được danh sách');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const displayList = filteredList ?? users;

  const handleSearch = () => {
    const id = searchId.trim();
    if (!id) {
      setFilteredList(null);
      return;
    }
    const num = Number(id);
    if (Number.isNaN(num)) {
      setError('ID phải là số');
      return;
    }
    setError(null);
    userService
      .getById(num)
      .then((user) => setFilteredList([user]))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Không tìm thấy user');
        setFilteredList([]);
      });
  };

  const handleClearResults = () => {
    setSearchId('');
    setFilteredList(null);
    setError(null);
  };

  const handleAddUser = () => {
    const name = addName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    userService
      .create(name)
      .then((created) => {
        setUsers((prev) => [...prev, created]);
        setAddName('');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Thêm thất bại');
      })
      .finally(() => setAdding(false));
  };

  const handleCreateTemplate = () => {
    const name = `Sample User 1 - ${new Date().toISOString().slice(0, 19).replace('T', '_')}`;
    setAdding(true);
    setError(null);
    userService
      .create(name)
      .then((created) => {
        setUsers((prev) => [...prev, created]);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Tạo mẫu thất bại');
      })
      .finally(() => setAdding(false));
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = () => {
    if (editingId == null) return;
    const name = editName.trim();
    if (!name) return;
    userService
      .update(editingId, name)
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
        if (filteredList) setFilteredList([updated]);
        cancelEdit();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
      });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    userService
      .delete(id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (filteredList) setFilteredList((prev) => (prev ? prev.filter((u) => u.id !== id) : null));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Xóa thất bại');
      });
  };

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-sky-50 to-amber-50/40">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Quản lý người dùng
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
            <div className="mt-2 text-sm text-slate-500">
              <Link to="/" className="hover:text-blue-600">
                Trang chủ
              </Link>{' '}
              / <span>Users</span>
            </div>
            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-600">
              Kết nối máy chủ: <code>{userService.getBaseUrl()}</code>
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Tải lại danh sách
            </button>
            <input
              type="text"
              placeholder="Nhập tên người dùng..."
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddUser}
              disabled={adding || !addName.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Thêm người dùng
            </button>
            <button
              type="button"
              onClick={handleCreateTemplate}
              disabled={adding}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
            >
              Tạo mẫu
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700">ID</label>
            <input
              type="text"
              placeholder="Nhập ID người dùng..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleClearResults}
              className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
            >
              Xóa kết quả
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Đang tải...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800 text-left text-sm font-medium text-white">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    displayList.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 bg-white hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 text-slate-700">{user.id}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {editingId === user.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {editingId === user.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="rounded p-1.5 text-green-600 hover:bg-green-50"
                                  title="Lưu"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(user)}
                                  className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                  title="Sửa"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(user.id)}
                                  className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
