import request from 'supertest';
import app from '../app';

describe('Complaints Module API', () => {
  it('should return 401 Unauthorized when getting complaints without JWT', async () => {
    const res = await request(app).get('/api/v1/complaints');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('not logged in');
  });

  it('should return 401 Unauthorized when posting complaint without token', async () => {
    const res = await request(app).post('/api/v1/complaints').send({
      title: 'Plumbing Issue',
      description: 'Water leak',
      category: 'plumbing'
    });
    expect(res.status).toBe(401);
  });
});
