import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('MindTrack API Integration Tests', () => {
  it('GET /api/health returns healthy status and medical disclaimer', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.disclaimer).toContain('Not a medical diagnostic tool');
  });

  it('Protected route rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/surveys');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('Rejects invalid login credentials with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@mindtrack.edu',
      password: 'WrongPassword123',
    });

    expect(res.status).toBe(401);
  });

  it('validates public signup and never grants staff privileges', async () => {
    const weakPassword = await request(app).post('/api/auth/signup').send({
      name: 'Test Student', email: 'test.student@example.com', password: 'short', role: 'ADMIN',
    });
    expect(weakPassword.status).toBe(400);

    const created = await request(app).post('/api/auth/signup').send({
      name: 'Test Student', email: `test.${Date.now()}@example.com`, password: 'SecurePass123!', role: 'ADMIN',
    });
    expect(created.status).toBe(201);
    expect(created.body.user.role).toBe('STUDENT');
    expect(created.body.token).toBeTruthy();
  });
});
