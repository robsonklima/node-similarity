const request = require('supertest');
const { User } = require('../../models/user');
const { Project } = require('../../models/project');

describe('auth middleware', () => {
  let server;

  beforeEach(() => { server = require('../../index'); });  
  afterEach(async () => { 
    await Project.remove({});
    await server.close();
  });

  it('should return 401 if no token is provided', async () => {
    const token = '';

    const res = await request(server)
      .post('/api/projects')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    const token = 'a';

    const res = await request(server)
      .post('/api/projects')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post('/api/projects')
      .set('x-auth-token', token)
      .send({ name: 'project1' });

    expect(res.status).toBe(200);
  });
});