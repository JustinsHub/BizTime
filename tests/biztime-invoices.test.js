process.env.NODE_ENV = "test"
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testInvoice;


beforeEach(async ()=>{
    const invoice = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date)
                                    VALUES ('apple', 100, false, null) RETURNING *`)
    testInvoice = invoice.rows[0]
})

afterEach(async ()=>{
    await db.query('DELETE FROM invoices')
})

afterAll(async ()=>{
    await db.end()
})

//Invoice Routes Test
describe('GET /invoices', ()=>{
    test('Get all invoices', async()=>{
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({invoices: [testInvoice]})
    })
})

describe('GET /invoices/:id', ()=>{
    test('Get an invoice', async()=>{
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({invoice: [testInvoice]})
    })
    test('Respond 404 if id is not found', async()=>{
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe('/POST /invoice', ()=>{
    test('Creating an invoice', async()=>{
        const res = await request(app).post('/invoices').send({comp_code:"apple", amt:5000})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({invoice: {id: expect.any(Number), comp_code: "apple", amt:5000}})
    })
})

describe('PATCH /invoices/:id', ()=>{
    test('Update an invoice', async()=>{
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({amt:2000})
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({invoice: {id:testInvoice.id, amt:2000}})
    })
    test('Respond 404 if id is not found', async()=>{
        const res = await request(app).patch(`/invoices/0`).send({amt:2000})
        expect(res.statusCode).toBe(404)
    })
})

describe('DELETE /invoices/:id', ()=>{
    test('Delete an invoice', async()=>{
        const res = await request(app).delete(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({status: "Deleted"})
    })
    test('Respond 404 if invoice id is not found', async()=>{
        const res = await request(app).delete('/invoices/0')
        expect(res.statusCode).toBe(404)
    })
})