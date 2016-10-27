import request from 'supertest-as-promised'
import { masterKey } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes, { <%= userApiPascal %> } from '.'

const app = () => express(routes)

let <%= userApiCamel %>1, <%= userApiCamel %>2, admin, session1, session2, adminSession

beforeEach(async () => {
  <%= userApiCamel %>1 = await <%= userApiPascal %>.create({ name: 'user', email: 'a@a.com', password: '123456' })
  <%= userApiCamel %>2 = await <%= userApiPascal %>.create({ name: 'user', email: 'b@b.com', password: '123456' })
  admin = await <%= userApiPascal %>.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  session1 = signSync(<%= userApiCamel %>1.id)
  session2 = signSync(<%= userApiCamel %>2.id)
  adminSession = signSync(admin.id)
})

test('GET /<%= userApiKebabs %> 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /<%= userApiKebabs %>?page=2&limit=1 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, page: 2, limit: 1 })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /<%= userApiKebabs %>?q=user 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, q: 'user' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /<%= userApiKebabs %>?fields=name 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, fields: 'name' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(Object.keys(body[0])).toEqual(['id', 'name'])
})

test('GET /<%= userApiKebabs %> 401 (user)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

test('GET /<%= userApiKebabs %> 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

test('GET /<%= userApiKebabs %>/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: session1 })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(<%= userApiCamel %>1.id)
})

test('GET /<%= userApiKebabs %>/me 401', async () => {
  const { status } = await request(app())
    .get('/me')
  expect(status).toBe(401)
})

test('GET /<%= userApiKebabs %>/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${<%= userApiCamel %>1.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(<%= userApiCamel %>1.id)
})

test('GET /<%= userApiKebabs %>/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('POST /<%= userApiKebabs %> 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /<%= userApiKebabs %> 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'user' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /<%= userApiKebabs %> 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'admin' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /<%= userApiKebabs %> 409 (master) - duplicated email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', password: '123456' })
  expect(status).toBe(409)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /<%= userApiKebabs %> 400 (master) - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', password: '123456' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /<%= userApiKebabs %> 400 (master) - missing email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, password: '123456' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

<%_ if (passwordSignup) { _%>
test('POST /<%= userApiKebabs %> 400 (master) - invalid password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('POST /<%= userApiKebabs %> 400 (master) - missing password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

<%_ } _%>
test('POST /<%= userApiKebabs %> 400 (master) - invalid role', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'invalid' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('role')
})

test('POST /<%= userApiKebabs %> 401 (admin)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: adminSession, email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('POST /<%= userApiKebabs %> 401 (user)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: session1, email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('POST /<%= userApiKebabs %> 401', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /<%= userApiKebabs %>/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
})

test('PUT /<%= userApiKebabs %>/me 401', async () => {
  const { status } = await request(app())
    .put('/me')
    .send({ name: 'test' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /<%= userApiKebabs %>/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
})

test('PUT /<%= userApiKebabs %>/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: adminSession, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /<%= userApiKebabs %>/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: session2, name: 'test' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}`)
    .send({ name: 'test' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test' })
  expect(status).toBe(404)
})

<%_ if (passwordSignup) { _%>
const passwordMatch = async (password, userId) => {
  const user = await <%= userApiPascal %>.findById(userId)
  return !!await user.authenticate(password)
}

test('PUT /<%= userApiKebabs %>/me/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /<%= userApiKebabs %>/me/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /<%= userApiKebabs %>/me/password 401 (user) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ access_token: session1, password: '654321' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/me/password 401', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /<%= userApiKebabs %>/:id/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /<%= userApiKebabs %>/:id/password 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}/password`)
    .auth('b@b.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id/password 401 (user) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}/password`)
    .send({ access_token: session1, password: '654321' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id/password 401', async () => {
  const { status } = await request(app())
    .put(`/${<%= userApiCamel %>1.id}/password`)
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /<%= userApiKebabs %>/:id/password 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(404)
})

<%_ } _%>
test('DELETE /<%= userApiKebabs %>/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /<%= userApiKebabs %>/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${<%= userApiCamel %>1.id}`)
    .send({ access_token: session1 })
  expect(status).toBe(401)
})

test('DELETE /<%= userApiKebabs %>/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${<%= userApiCamel %>1.id}`)
  expect(status).toBe(401)
})

test('DELETE /<%= userApiKebabs %>/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .send({ access_token: adminSession })
  expect(status).toBe(404)
})