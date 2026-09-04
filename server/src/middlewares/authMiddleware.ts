import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user role
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'FINANCE_AGENT' | 'VIEWER';
  };
}

export function requireRole(allowedRoles: ('ADMIN' | 'FINANCE_AGENT' | 'VIEWER')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // For local development/testing without a full JWT token yet, 
    // we check a custom header `x-user-role`, defaulting to 'ADMIN' if absent.
    const userRole = (req.headers['x-user-role'] as 'ADMIN' | 'FINANCE_AGENT' | 'VIEWER') || 'ADMIN';

    req.user = {
      id: 'usr_mock_123',
      email: 'admin@reviveflow.ai',
      role: userRole,
    };

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden: Your role does not have permission to execute this high-risk action.' 
      });
    }

    next();
  };
}