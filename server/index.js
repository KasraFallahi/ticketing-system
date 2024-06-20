'use strict';

const express = require('express');
const Database = require('./db/db');
const cors = require('cors');
const { initAuthentication, isLoggedIn } = require('./auth');

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret =
	'47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const expireTime = 60; //seconds

// init express
const app = new express();
const port = 3001;
const db = new Database('./db/ticket.db');

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
 * Logout
 */
app.delete('/api/session', isLoggedIn, (req, res) => {
	req.logout(() => res.end());
});

/**
 * Check if the user is logged in and return their info
 */
// app.get('/api/session/current', isLoggedIn, async (req, res) => {
// 	// let studyPlan = undefined;
// 	let err = false;

// 	if (req.user.fullTime !== null) {
// 		await db
// 			.getStudyPlan(req.user.id)
// 			.then((sp) => (studyPlan = sp))
// 			.catch(() => {
// 				res.status(500).json({ errors: ['Database error'] });
// 				err = true;
// 			});
// 	}

// 	if (!err)
// 		res.json({
// 			email: req.user.username,
// 			name: req.user.name,
// 			studyPlan,
// 		});
// });

/*** Token ***/
/**
 * Get token
 */
app.get('/api/auth-token', isLoggedIn, (req, res) => {
	const fullTime = req.user.fullTime;

	const payloadToSign = { fullTime: fullTime, userId: req.user.id };
	const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {
		expiresIn: expireTime,
	});

	res.json({ token: jwtToken });
});

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
