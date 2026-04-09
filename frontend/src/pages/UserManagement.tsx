import { useEffect, useState } from "react"
import { API_BASE_URL } from "../lib/globalVars"
import { Button } from "../components/ui/button"
import { Mail, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import { InviteUserDialog } from "@/components/InviteUserDialog"
import LoadingSpinner from "@/components/LoadingSpinner"

interface UserDTO {
  id: number;
  email: string;
  name: string;
  surname: string;
  active: boolean;
  isAdmin: boolean;
}

function UserManagement() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users from the server');
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated]);

  const handleReinvite = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/re-invite`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        alert("Invitation code regenerated and sent.");
      }
    } catch (err) {
      console.error("Re-invite failed", err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  if (loading || authLoading) return (
    <LoadingSpinner text="Loading User Directory.."/>
  );

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Connection Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4 border-red-200 hover:bg-red-100" onClick={() => fetchUsers()}>
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access, roles, and invitations.</p>
        </div>
        <InviteUserDialog onSuccess={fetchUsers}/>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>A total of {users.length} users are registered in IR-Board.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name} {user.surname}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="uppercase text-[10px]">
                        Deactivated
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        System Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleReinvite(user.id)}
                      className="text-slate-600 hover:text-indigo-600"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Re-invite
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserManagement;