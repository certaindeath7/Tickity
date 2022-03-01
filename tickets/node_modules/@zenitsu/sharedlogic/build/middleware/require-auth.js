"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
var requireAuth = function (req, res, next) {
    if (!req.currentUser) {
        return res.status(401).json({ errors: [{ msg: "The user is not authorized" }] });
    }
    next();
};
exports.requireAuth = requireAuth;
