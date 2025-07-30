
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Shield, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

interface User {
  id: number;
  email: string;
  business_name: string | null;
  shop_type: string | null;
  status: 'Active' | 'Inactive'; // Assuming status is handled client-side or needs a new backend field
  role: 'Admin' | 'User'; // Assuming role is handled client-side or needs a new backend field
  plan: 'Premium' | 'Freemium';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await fetch(`${API_BASE_URL}/api/users.php?action=read_all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
        
        // Add static status/role for demonstration as backend doesn't provide it
        const usersWithDetails = (data.users || []).map((user: any) => ({
          ...user,
          status: user.id % 2 === 0 ? 'Inactive' : 'Active', // Mock status
          role: user.id === 1 ? 'Admin' : 'User', // Mock role, assuming user 1 is admin
          plan: user.id % 3 === 0 ? 'Freemium' : 'Premium', // Mock plan
        }));
        setUsers(usersWithDetails);

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error fetching users', description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);


  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // API call to delete user would go here
      console.log(`Deleting user ${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast({ title: "User Deleted", description: "The user has been removed from the list."});
    }
  };

  const handleMakeAdmin = (id: number) => {
     // API call to update role would go here
    setUsers(users.map(u => u.id === id ? { ...u, role: 'Admin' } : u));
  };
  
  const handleRevokeAdmin = (id: number) => {
     // API call to update role would go here
    setUsers(users.map(u => u.id === id ? { ...u, role: 'User' } : u));
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users in the system.</p>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Shop Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                 users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.business_name || 'N/A'}</TableCell>
                  <TableCell>{user.shop_type || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} 
                    className={user.status === 'Active' ? 'bg-green-500/20 text-green-500 border-green-500/20' : 'bg-red-500/20 text-red-500 border-red-500/20'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'secondary' : 'outline'}
                      className={user.role === 'Admin' ? 'border-yellow-500/50' : ''}>
                      {user.role}
                    </Badge>
                  </TableCell>
                   <TableCell>
                    <Badge variant={user.plan === 'Premium' ? 'default' : 'outline'}
                      className={user.plan === 'Premium' ? 'bg-primary/80 text-primary-foreground' : ''}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert('Edit functionality not implemented.')}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit User</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role !== 'Admin' ? (
                          <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Make Admin</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleRevokeAdmin(user.id)}>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Revoke Admin</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete User</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
