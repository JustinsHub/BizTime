/** BizTime express application. */

const express = require("express");
const ExpressError = require("./expressError")
const companyRoute = require('./routes/companies')
const morgan = require('morgan')
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req,res,next)=>{
  return res.json('Homepage')
})
app.use('/companies', companyRoute)

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
  });
});


module.exports = app;
