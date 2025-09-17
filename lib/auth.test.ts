// lib/auth.test.ts
// -----------------------------------------------------------
// Tests para el middleware de autenticación requireAuth
// - Casos de éxito: token válido, usuario existe
// - Casos de error: sin token, token inválido, usuario no existe
// -----------------------------------------------------------

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth, AuthenticatedNextApiRequest } from './auth';
import User from '../models/User';
import type { NextApiResponse } from 'next';

// 🔹 Setup JWT secret para tests
const setupTestJWTSecret = () => {
  process.env.JWT_SECRET = 'test-secret-for-vitest-123';
};

// 🔹 Test users data
const TEST_USERS = {
  user1: {
    email: 'test@example.com',
    name: 'Test User'
  }
};

// 🔹 Mock del modelo User para casos específicos
vi.mock('../models/User', () => ({
  default: {
    findById: vi.fn()
  }
}));

// 🔹 Crear mock de response
const createMockResponse = (): Partial<NextApiResponse> => {
  const res: Partial<NextApiResponse> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

// 🔹 Crear mock de request
const createMockRequest = (
  cookies: Record<string, string> = {}, 
  method = 'GET'
): Partial<AuthenticatedNextApiRequest> => ({
  method,
  cookies,
  headers: {}
});

describe('lib/auth.ts - requireAuth middleware', () => {
  
  beforeEach(() => {
    // Setup JWT secret para tests
    setupTestJWTSecret();
    vi.clearAllMocks();
  });

  describe('✅ Casos de éxito', () => {
    
    it('debe permitir acceso con token válido y usuario existente', async () => {
      // Arrange
      const testUser = {
        _id: '507f1f77bcf86cd799439011',
        email: TEST_USERS.user1.email,
        name: TEST_USERS.user1.name,
        favorites: []
      };
      
      const token = jwt.sign(
        { id: testUser._id }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '1h' }
      );
      
      // Mock User.findById para retornar usuario
      (User.findById as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue(testUser)
      });
      
      const req = createMockRequest({ token });
      const res = createMockResponse();
      
      // Handler mock que verifica que req.user esté presente
      const mockHandler = vi.fn(async (req: AuthenticatedNextApiRequest) => {
        expect(req.user).toEqual(testUser);
      });
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      expect(res.status).not.toHaveBeenCalled(); // No debe haber error
    });
    
  });

  describe('❌ Casos de error', () => {
    
    it('debe rechazar request sin token', async () => {
      // Arrange
      const req = createMockRequest({}); // Sin cookies
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "No autorizado" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe rechazar token inválido/malformado', async () => {
      // Arrange
      const req = createMockRequest({ token: 'token-invalido' });
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe rechazar token válido pero usuario no existe', async () => {
      // Arrange
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = jwt.sign(
        { id: fakeUserId }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '1h' }
      );
      
      // Mock User.findById para retornar null (usuario no existe)
      (User.findById as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });
      
      const req = createMockRequest({ token });
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuario no encontrado" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe manejar error cuando JWT_SECRET no está definido', async () => {
      // Arrange
      delete process.env.JWT_SECRET; // Simular JWT_SECRET faltante
      
      const req = createMockRequest({ token: 'cualquier-token' });
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe manejar error de base de datos', async () => {
      // Arrange
      const testUserId = '507f1f77bcf86cd799439011';
      const token = jwt.sign(
        { id: testUserId }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '1h' }
      );
      
      // Mock User.findById para lanzar error de DB
      (User.findById as Mock).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Database error'))
      });
      
      const req = createMockRequest({ token });
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const protectedHandler = requireAuth(mockHandler);
      await protectedHandler(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
  });
  
});