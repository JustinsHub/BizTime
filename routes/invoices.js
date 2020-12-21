const express = require('express')
const { route } = require('../app')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')

router.get('/', async(req, res, next)=>{
    try{
    const results = await db.query('SELECT * FROM invoices')
    return res.json({invoices: results.rows})
    }catch(err){
        next(err)
    }
})

router.get('/:id', async(req,res,next)=>{
    try{
        const {id} = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if(results.rows.length === 0){
            throw new ExpressError('Can\'t find that invoice', 404)
        }
        return res.json({invoice: results.rows})
    }catch(err){
        next(err)
    }
})

router.post('/', async(req, res, next)=>{
    try{
        const {comp_code, amt} = req.body
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt])
        return res.status(201).json({invoice: results.rows[0]})
    }catch(err){
        next(err)
    }
})

router.patch('/:id', async(req,res,next)=>{
    try{
        const {id} = req.params
        const {amt, paid} = req.body
        const results = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING *', [amt, paid, id])
    if(results.rows.length === 0){
        throw new ExpressError('That invoice cannot be found', 404)
    }
    return res.json({invoice: results.rows[0]})
    }catch(err){
        next(err)
    }
})

router.delete('/:id', async(req, res, next)=>{
    try{
    const {id} = req.params
    const results = await db.query('DELETE FROM invoices WHERE id=$1', [id])
    return res.json({status: "Deleted"})
    }catch(err){
        next(err)
    }
})

module.exports = router;