
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';

const sampleUsers = [
  { id: 1, email: 'manager@example.com', businessName: 'Main Supermarket', shopType: 'Supermarket/FMCG', status: 'Active', role: 'Admin' },
  { id: 2, email: 'cashier1@example.com', businessName: 'Downtown Apparel', shopType: 'Apparel Store', status: 'Active', role: 'User' },
  { id: 3, email: 'user@example.com', businessName: 'City Electronics', shopType: 'Electronics Store', status: 'Inactive', role: 'User' },
  { id: 4, email: 'fuel.manager@example.com', businessName: 'Highway Fuel Stop', shopType: 'Fuel Station', status: 'Active', role: 'Admin' },
  { id: 5, email: 'chef@example.com', businessName: 'The Corner Bistro', shopType: 'Restaurant', status: 'Active', role: 'User' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(sampleUsers);

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleMakeAdmin = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: 'Admin' } : u));
  };
  
  const handleRevokeAdmin = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: 'User' } : u));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Shop Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.businessName}</TableCell>
                <TableCell>{user.shopType}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
