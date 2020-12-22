const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next)=>{
    try{
    const results = await db.query('SELECT * FROM industries')
    return res.json({industry: results.rows})
    }catch(err){
        next(err)
    }
})

router.get('/:code', async(req, res, next)=>{
    try{
    const {code} = req.params
    const industry = await db.query(`SELECT * FROM industries WHERE company_code=$1`, [code])
    const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])

    industryResults = industry.rows
    industryResults.companies = company.rows
    return res.json({industry: industryResults})
    }catch(err){
        next(err)
    }
})  

router.post('/', async(req, res, next)=>{
    try{
    const {code, industry, company_code} = req.body
    const results = await db.query(`INSERT INTO industries (code, industry, company_code)
                                    VALUES ($1,$2,$3) RETURNING *`, [code, industry, company_code])
    return res.status(201).json({industry: results.rows[0]})
    }catch(err){
        next(err)
    }
})
module.exports = router;