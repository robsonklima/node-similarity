const request = require('supertest');
const { Project } = require('../../models/project');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

describe('/api/projects', () => {
  let server;

  beforeEach(() => { 
    server = require('../../index'); 
  });
  
  afterEach(async () => { 
    await Project.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all projects', async () => {
      await Project.collection.insertMany([
        { name: 'project1' }, { name: 'project2' }
      ]);

      const res = await request(server).get('/api/projects/');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(p => p.name === 'project1')).toBeTruthy();
      expect(res.body.some(p => p.name === 'project2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a project if valid id is passed', async () => {
      const project = new Project({ name: 'project1' });
      await project.save();

      const res = await request(server).get('/api/projects/' + project._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', project.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/projects/1');
      expect(res.status).toBe(404);
    });

    it('should return 404 if no project with given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/projects/' + id);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('should return 401 if the client is not logged in', async () => {
      const res = await request(server)
        .post('/api/projects')
        .send({ name: 'project1' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if project name is less than 5 characters', async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post('/api/projects')
        .set('x-auth-token', token)
        .send({ name: '1234' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if project name is more than 50 characters', async () => {
      const token = new User().generateAuthToken();

      const name = Array(52).join('a');

      const res = await request(server)
        .post('/api/projects')
        .set('x-auth-token', token)
        .send({ name: name });

      expect(res.status).toBe(400);
    });

    it('should save the project if it is valid', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post('/api/projects')
        .set('x-auth-token', token)
        .send({ name: 'project1' });

      const project = await Project.find({ name: 'project1' })

      expect(project).not.toBeNull();
    });

    it('should return the project if it is valid', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post('/api/projects')
        .set('x-auth-token', token)
        .send({ name: 'project1' });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'project1');
    });    
  });

  describe('PUT /:id', () => {
    beforeEach(async () => {
      project = new Project({ name: 'project1' });
      await project.save();
      
      token = new User().generateAuthToken();     
      id = project._id; 
      newName = 'updatedName'; 
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      expect(res.status).toBe(401);
    });

    it('should return 400 if poject is less than 5 characters', async () => {
      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: '1234' });

      expect(res.status).toBe(400);
    });

    it('should return 400 if project is more than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      expect(res.status).toBe(404);
    });

    it('should return 404 if project with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      expect(res.status).toBe(404);
    });

    it('should update the project if input is valid', async () => {
      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      const updatedProject = await Project.findById(project._id);

      expect(updatedProject.name).toBe(newName);
    });

    it('should return the updated project if it is valid', async () => {
      const res = await request(server)
        .put('/api/projects/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });
  });  

  describe('DELETE /:id', () => {
    let token; 
    let project; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/api/projects/' + id)
        .set('x-auth-token', token)
        .send();
    }

    beforeEach(async () => {
      project = new Project({ name: 'project1' });
      await project.save();
      
      id = project._id; 
      token = new User({ isAdmin: true }).generateAuthToken();     
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken(); 

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no project with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the project if input is valid', async () => {
      await exec();

      const projectInDb = await Project.findById(id);

      expect(projectInDb).toBeNull();
    });

    it('should return the removed project', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', project._id.toHexString());
      expect(res.body).toHaveProperty('name', project.name);
    });
  }); 
});