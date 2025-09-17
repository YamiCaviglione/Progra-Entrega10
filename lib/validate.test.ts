// lib/validate.test.ts
// -----------------------------------------------------------
// Tests para el middleware de validación validateBody
// - Casos de éxito: datos válidos según schema
// - Casos de error: datos inválidos, campos faltantes
// -----------------------------------------------------------

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateBody } from './validate';
import { AuthenticatedNextApiRequest } from './auth';
import type { NextApiResponse } from 'next';

// 🔹 Crear mock de response
const createMockResponse = (): Partial<NextApiResponse> => {
  const res: Partial<NextApiResponse> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

// 🔹 Crear mock de request
const createMockRequest = (body: unknown = {}): Partial<AuthenticatedNextApiRequest> => ({
  method: 'POST',
  body,
  headers: { 'content-type': 'application/json' }
});

describe('lib/validate.ts - validateBody middleware', () => {

  describe('✅ Casos de éxito', () => {
    
    it('debe permitir datos válidos según schema simple', async () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });
      
      const validData = { name: 'Juan', age: 25 };
      const req = createMockRequest(validData);
      const res = createMockResponse();
      
      const mockHandler = vi.fn(async (req: AuthenticatedNextApiRequest) => {
        // Verificar que req.body contiene los datos validados
        expect(req.body).toEqual(validData);
      });
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled(); // No debe haber error
    });
    
    it('debe permitir datos con campos opcionales', async () => {
      // Arrange
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional() // Campo opcional
      });
      
      const validData = { 
        email: 'test@example.com', 
        password: 'password123' 
        // name omitido (opcional)
      };
      
      const req = createMockRequest(validData);
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('debe transformar datos según schema (coerción)', async () => {
      // Arrange
      const schema = z.object({
        rating: z.coerce.number().min(1).max(5), // Coerción de string a number
        text: z.string().trim() // Trim automático
      });
      
      const inputData = { rating: '4', text: '  Gran libro!  ' };
      const expectedData = { rating: 4, text: 'Gran libro!' };
      
      const req = createMockRequest(inputData);
      const res = createMockResponse();
      
      const mockHandler = vi.fn(async (req: AuthenticatedNextApiRequest) => {
        expect(req.body).toEqual(expectedData);
      });
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
    
  });

  describe('❌ Casos de error', () => {
    
    it('debe rechazar datos faltantes', async () => {
      // Arrange
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
      });
      
      const invalidData = { email: 'test@example.com' }; // Falta password
      const req = createMockRequest(invalidData);
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.arrayContaining([
          expect.objectContaining({
            path: ['password'],
            code: 'invalid_type'
          })
        ])
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe rechazar datos con formato inválido', async () => {
      // Arrange
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(0)
      });
      
      const invalidData = { 
        email: 'email-invalido', // Email sin formato válido
        age: -5 // Edad negativa
      };
      
      const req = createMockRequest(invalidData);
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.arrayContaining([
          expect.objectContaining({
            path: ['email'],
            code: expect.stringMatching(/invalid_string|invalid_format/)
          }),
          expect.objectContaining({
            path: ['age'],
            code: 'too_small'
          })
        ])
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe rechazar tipos de datos incorrectos', async () => {
      // Arrange
      const schema = z.object({
        rating: z.number().min(1).max(5),
        text: z.string()
      });
      
      const invalidData = { 
        rating: 'not-a-number', // String en lugar de number
        text: 123 // Number en lugar de string
      };
      
      const req = createMockRequest(invalidData);
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.arrayContaining([
          expect.objectContaining({
            path: ['rating'],
            code: 'invalid_type'
          }),
          expect.objectContaining({
            path: ['text'],
            code: 'invalid_type'
          })
        ])
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
    it('debe manejar body vacío o null', async () => {
      // Arrange
      const schema = z.object({
        name: z.string()
      });
      
      const req = createMockRequest(null); // Body null
      const res = createMockResponse();
      const mockHandler = vi.fn();
      
      // Act
      const validator = validateBody(schema, mockHandler);
      await validator(req as AuthenticatedNextApiRequest, res as NextApiResponse);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.arrayContaining([
          expect.objectContaining({
            code: 'invalid_type'
          })
        ])
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });
    
  });
  
});