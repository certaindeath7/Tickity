"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidate = void 0;
var express_validator_1 = require("express-validator");
var request_validation_error_1 = require("../errors/request-validation-error");
var requestValidate = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new request_validation_error_1.RequestValidationError(errors.array());
    }
    // if we passed the if statemant,
    //pass in the next() to move on to the next middleware function
    next();
};
exports.requestValidate = requestValidate;
