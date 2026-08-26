import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (id: number, enabled: boolean) => {
    await adminApi.updateUserStatus(id, !enabled);
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await adminApi.deleteUser(id);
      fetchUsers();
    }
  };

  const updateRole = async (id: number, role: string) => {
    try {
      await adminApi.updateUserRole(id, role);
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      alert('Failed to update role: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="ambient-rose-content" aria-hidden="true" />
      <h1 className="font-serif text-[32px] font-bold text-heading-theme relative z-10">User Management</h1>
      <div className="glass-3 overflow-hidden relative z-10 rounded-2xl border border-border/50">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-lg font-semibold text-heading-theme">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/50 bg-black/5 dark:bg-black/5 dark:bg-white/5">
                <th className="px-6 py-3 text-[12px] font-semibold text-secondary-theme uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-secondary-theme uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-secondary-theme uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-secondary-theme uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-secondary-theme uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-secondary-theme">{u.id}</td>
                  <td className="px-6 py-4 text-heading-theme font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="border border-border/50 rounded-md p-1.5 text-sm bg-background text-primary-theme focus:ring-1 focus:ring-primary/20 focus:outline-none"
                      disabled={u.deleted}
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                      u.deleted ? 'bg-black/10 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 text-muted-theme' :
                      u.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {u.deleted ? 'Deleted' : (u.enabled ? 'Active' : 'Disabled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button onClick={() => toggleStatus(u.id, u.enabled)} className="text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:opacity-50" disabled={u.deleted}>Toggle Status</button>
                    <button onClick={() => deleteUser(u.id)} className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors disabled:opacity-50" disabled={u.deleted}>Delete</button>
                    <button onClick={async () => {
                      if (confirm("Are you sure you want to impersonate this user?")) {
                        try {
                          const data = await adminApi.impersonateUser(u.id);
                          localStorage.setItem('token', data.accessToken);
                          localStorage.setItem('refreshToken', data.refreshToken);
                          if (data.user) {
                            localStorage.setItem('user', JSON.stringify(data.user));
                          }
                          window.location.href = '/';
                        } catch (e: any) {
                          alert('Failed to impersonate: ' + (e.response?.data?.message || e.message));
                        }
                      }
                    }} className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors disabled:opacity-50" disabled={u.deleted}>Impersonate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
