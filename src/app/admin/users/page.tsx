"use client";

import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionStatus: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  _count?: {
    tests: number;
    attempts: number;
    studyPlans: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, subscriptionFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(subscriptionFilter && { subscription: subscriptionFilter }),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("User deleted successfully");
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      subscriptionStatus: formData.get("subscriptionStatus") as string,
      emailVerified: formData.get("emailVerified") === "on",
    };

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("User updated successfully");
        setShowEdit(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update user");
      }
    } catch (error) {
      alert("Failed to update user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{users.length}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Verified</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {users.filter((u) => u.emailVerified).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pro Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {users.filter((u) => u.subscriptionStatus === "pro").length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Admins</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={subscriptionFilter}
            onChange={(e) => {
              setSubscriptionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subscriptions</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="topper">Topper</option>
          </select>
          <button
            onClick={() => fetchUsers()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Users</h3>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Subscription
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-slate-900">{user.email}</p>
                          <div className="flex gap-2 text-xs text-slate-500 mt-1">
                            {user.emailVerified && (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </span>
                            )}
                            {user.onboardingCompleted && <span>Onboarded</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">{user.name || "-"}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-800"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${user.subscriptionStatus === "pro"
                              ? "bg-blue-100 text-blue-800"
                              : user.subscriptionStatus === "topper"
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                        >
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {user._count ? (
                          <div>
                            {user._count.tests} tests, {user._count.attempts} attempts
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEdit(true);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedUser.name || ""}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subscription
                </label>
                <select
                  name="subscriptionStatus"
                  defaultValue={selectedUser.subscriptionStatus}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="topper">Topper</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="emailVerified"
                  defaultChecked={selectedUser.emailVerified}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-slate-700">
                  Email Verified
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
