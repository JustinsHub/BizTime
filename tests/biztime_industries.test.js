process.env.NODE_ENV = "test"
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testIndustry;

beforeEach(async ()=>{
    const industry = await db.query(`INSERT INTO industries (code, industry, company_code)
                                    VALUES ('WT', 'water', 'apple') RETURNING *`)
    testIndustry = industry.rows[0]
})

afterEach(async ()=>{
    await db.query('DELETE FROM industries')
})

afterAll(async ()=>{
    await db.end()
})

describe('GET /industries', ()=>{
    test('Get all industries', async()=>{
        const res = await request(app).get('/industries')
        expect(res.statusCode).toBe(200)
    })
})