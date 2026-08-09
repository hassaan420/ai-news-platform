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
    await adminApi.updateUserRole(id, role);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{u.id}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="border border-border/60 rounded-md p-1.5 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      disabled={u.deleted}
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                      u.deleted ? 'bg-muted text-muted-foreground' :
                      u.enabled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {u.deleted ? 'Deleted' : (u.enabled ? 'Active' : 'Disabled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button onClick={() => toggleStatus(u.id, u.enabled)} className="text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:opacity-50" disabled={u.deleted}>Toggle Status</button>
                    <button onClick={() => deleteUser(u.id)} className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors disabled:opacity-50" disabled={u.deleted}>Delete</button>
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
