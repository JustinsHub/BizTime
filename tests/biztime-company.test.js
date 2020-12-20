process.env.NODE_ENV = "test"
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany;


beforeEach(async ()=>{
    const company = await db.query(`INSERT INTO companies (code, name, description)
                                    VALUES ('Dogs', 'Dexter', 'GoldenDoodle') RETURNING code, name, description`)
    testCompany = company.rows[0]
})

afterEach(async ()=>{
    await db.query('DELETE FROM companies')
})

afterAll(async ()=>{
    await db.end()
})

//Company Routes Test
describe('GET /companies', ()=>{
    test('Get all companies', async ()=>{
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies: [testCompany]})
    })
})

describe('GET /companies/:code', ()=>{
    test('Get single company', async()=>{
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company: testCompany})
    })
    test('Respond 404 if company is missing', async()=>{
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe('POST /companies', ()=>{
    test('Create a new company', async()=>{
        const res = await request(app).post('/companies').send({code:"TSLA", name:"Tesla", description:"Future cars"})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({company: {code:expect.any(String), name:"Tesla", description:"Future cars"}})
    })
})

describe('PATCH /companies/:code', ()=>{
    test('Updating a company', async()=>{
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({name:"Facebook", description:"A Website"})
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company: {code:testCompany.code, name:"Facebook", description:"A Website"}})
    })
    test('Respond 404 if company is missing', async()=>{
        const res = await request(app).patch(`/companies/0`).send({name:"Facebook", description:"A Website"})
        expect(res.statusCode).toBe(404)
    })
})

describe('DELETE /companies/:code', ()=>{
    test('Delete a company', async()=>{
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({status: "Deleted"})
    })
    test('Respond 404 if company is missing', async()=>{
        const res = await request(app).delete('/companies/poop')
        expect(res.statusCode).toBe(404)
    })
})

