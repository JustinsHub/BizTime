const express = require('express');
const { route } = require('../app');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next)=>{
    try{
    const results = await db.query('SELECT * FROM companies')
    return res.send({companies: results.rows})
    }catch(err){
        next(err)
    }
})

router.get('/:code', async (req, res, next)=>{
    try{
    const {code} = req.params
    const companies = await db.query('SELECT * FROM companies WHERE code=$1', [code])
    const industry = await db.query('SELECT industry FROM industries WHERE company_code=$1', [code]) // looking for the same code(req.params)
    if(companies.rows.length === 0){
        throw new ExpressError(`${code} can't be found`, 404)
    }
    const compResults = companies.rows[0]
    compResults.industry = industry.rows
    return res.json({company: compResults})
    }catch(err){
        next(err)
    }
})

router.post('/', async(req, res, next)=>{
    try{
    const {code, name, description} = req.body
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING *',
                                    [code, name, description])
    return res.status(201).json({company: results.rows[0]})
    }catch(err){
        next(err)
    }
})

router.patch('/:code', async(req,res,next)=>{
    try{
        const {code} = req.params
        const {name, description} = req.body
        const results = await db.query(
            `UPDATE companies
            SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
        [name, description, code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find ${code}`, 404)
        }
        return res.json({company: results.rows[0]})
    }catch(err){
        next(err)
    }
})


router.delete('/:code', async(req,res,next)=>{
    try{
        const {code} = req.params
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING *', [code])
        if(results.rows.length == 0){
            throw new ExpressError(`Can't delete. Can't find ${code}`, 404)
        }
        return res.send({status: "Deleted"})
    }catch(err){
        next(err)
    }
})

module.exports = router;