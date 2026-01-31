
import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Connor',
    email: 'sarah@skynet-defense.com',
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4'
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'john@techcorp.com',
    role: 'Editor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=c0aede'
  },
  {
    id: 'u3',
    name: 'Guest Observer',
    email: 'guest@auditor.com',
    role: 'Viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=ffdfbf'
  }
];

class AuthService {
  private currentUser: User = MOCK_USERS[0];

  getCurrentUser(): User {
    return this.currentUser;
  }

  // Simulate login/switching users for demo purposes
  switchUser(userId: string): User {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
    }
    return this.currentUser;
  }

  hasPermission(action: 'manage_connections' | 'import_data' | 'view_details'): boolean {
    const role = this.currentUser.role;

    switch (action) {
      case 'import_data':
        return role === 'Admin';
      case 'manage_connections':
        return role === 'Admin' || role === 'Editor';
      case 'view_details':
        return true; // Everyone can view
      default:
        return false;
    }
  }
}

export const authService = new AuthService();
