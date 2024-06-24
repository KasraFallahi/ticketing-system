'use strict';

const express = require('express');
const Database = require('./db/db');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { initAuthentication, isLoggedIn } = require('./auth');
const passport = require('passport');

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret =
	'47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const expireTime = 60; //seconds

// init express
const app = new express();
const port = 3001;
const db = new Database('./db/ticket.db');

// set up middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);

initAuthentication(app, db);

app.get('/api/tickets', async (req, res) => {
	try {
		// const filter = req.query && req.query.filter;
		// if (filter === 'enrolled') {
		//   const enrolled = await db.getNumStudents();
		//   res.json(enrolled);
		// } else {
		const tickets = await db.getTickets();
		res.json(tickets);
		// }
	} catch (err) {
		console.log(err);
		res.status(500).json({ errors: ['Database error'] });
	}
});

/*
 * Authenticate and login
 */
app.post(
	'/api/session',
	body('username', 'username is not a valid email').isEmail(),
	body('password', 'password must be a non-empty string').isString().notEmpty(),
	(req, res, next) => {
		// Check if validation is ok
		const err = validationResult(req);
		const errList = [];
		if (!err.isEmpty()) {
			errList.push(...err.errors.map((e) => e.msg));
			return res.status(400).json({ errors: errList });
		}

		// Perform the actual authentication
		passport.authenticate('local', (err, user) => {
			if (err) {
				res.status(err.status).json({ errors: [err.msg] });
			} else {
				req.login(user, (err) => {
					if (err) return next(err);
					else {
						res.json({
							email: user.username,
							name: user.name,
						});
					}
					// }
				});
			}
		})(req, res, next);
	}
);

/**
 * Logout
 */
app.delete('/api/session', isLoggedIn, (req, res) => {
	req.logout(() => res.end());
});

/**
 * Check if the user is logged in and return their info
 */
app.get('/api/session/current', isLoggedIn, async (req, res) => {
	res.json({
		email: req.user.username,
		name: req.user.name,
	});
});

/*** Token ***/
/**
 * Get token
 */
app.get('/api/auth-token', isLoggedIn, (req, res) => {
	const payloadToSign = { userId: req.user.id };
	const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {
		expiresIn: expireTime,
	});

	res.json({ token: jwtToken });
});

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
