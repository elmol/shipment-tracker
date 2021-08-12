const express = require('express');
require('express-async-handler');
const route = require('../app/routes');
const ValidationError = require('./error/validation.error');
const ContractError = require('./error/contract.error')
const StatusCodes = require('http-status-codes').StatusCodes

async function create(address) {
  var app = express();
  
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));
  // parse requests of content-type - application/json
  app.use(express.json());

  // define a simple route
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to decentralized shipment tracking application. Have your shipping orders completely traceable." });
  });

  app.address = address;

  await route(app);

  app.use(function handleValidationError(error, req, res, next) {
    if ( error instanceof ValidationError ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          httpStatus: StatusCodes.BAD_REQUEST,
          message: error.message,
          });
    }
    next(error);
  });

  app.use(function handleContractError(error, req, res, next) {
    if ( error instanceof ContractError ) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({
          httpStatus: StatusCodes.CONFLICT,
          message: error.message,
          });
    }
    next(error);
  });

  return app;
}

module.exports.create = create;