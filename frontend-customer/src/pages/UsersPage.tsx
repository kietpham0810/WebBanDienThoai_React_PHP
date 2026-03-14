import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { userService, type User } from '../services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getAll();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được danh sách users');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Users List</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Users List</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="text-slate-700">
            {user.id} - {user.name}
          </li>
        ))}
      </ul>
      {users.length === 0 && (
        <p className="text-slate-500">Chưa có user nào.</p>
      )}
    </div>
  );
}
