'use strict';

const express = require('express');
const Database = require('./database');
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
const db = new Database('./ticket.db');

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

/**
 * Create a new ticket for the currently logged in user
 */
app.post(
	'/api/create-ticket',
	isLoggedIn,
	// body('fullTime', 'fullTime must be a boolean').isBoolean(),
	// body('courses', 'No courses specified').isArray().isLength({ min: 1 }),
	// body('courses.*', 'Invalid course(s)')
	// 	.trim()
	// 	.toUpperCase()
	// 	.isString()
	// 	.isLength({ min: 7, max: 7 }),
	async (req, res) => {
		// Check if validation is ok
		const err = validationResult(req);
		const errList = [];
		if (!err.isEmpty()) {
			errList.push(...err.errors.map((e) => e.msg));
			return res.status(400).json({ errors: errList });
		}

		try {
			// Perform the actual insertions
			await db.createTicket(req.body, req.user.id);
			res.end();
		} catch (err) {
			console.log(err);
			return res.status(500).json({ errors: ['Database error'] });
		}
	}
);

/**
 * Edit the state of an existing ticket for the currently logged-in user
 */
app.patch('/api/ticket/:id', isLoggedIn, async (req, res) => {
	// Check if validation is ok
	const err = validationResult(req);
	const errList = [];
	if (!err.isEmpty()) {
		errList.push(...err.errors.map((e) => e.msg));
		return res.status(400).json({ errors: errList });
	}

	const { state } = req.body;
	const validStates = ['Open', 'Closed'];

	// Validate the state
	if (!validStates.includes(state)) {
		return res.status(400).json({
			errors: ['Invalid state. State must be either "Open" or "Closed"'],
		});
	}

	try {
		const ticketId = req.params.id;

		// Perform the actual update
		await db.updateTicketState(ticketId, state);
		res.end();
	} catch (err) {
		console.log(err);
		return res.status(500).json({ errors: ['Database error'] });
	}
});

/**
 * Add a text block to an existing ticket for the currently logged-in user
 */
app.post(
	'/api/ticket/:id/text-block',
	isLoggedIn,
	[body('text').notEmpty().withMessage('Text block content is required')],
	async (req, res) => {
		// Check if validation is ok
		const err = validationResult(req);
		const errList = [];
		if (!err.isEmpty()) {
			errList.push(...err.errors.map((e) => e.msg));
			return res.status(400).json({ errors: errList });
		}

		const ticketId = req.params.id;
		const userId = req.user.id;
		const { text } = req.body;

		try {
			// Perform the actual insertion
			await db.addTextBlock(ticketId, userId, text);
			res.end();
		} catch (err) {
			console.log(err);
			return res.status(500).json({ errors: ['Database error'] });
		}
	}
);

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
							id: user.id,
							is_admin: user.is_admin,
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
		id: req.user.id,
		email: req.user.username,
		name: req.user.name,
		is_admin: req.user.is_admin,
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
