'use strict';

const express = require('express');
const Database = require('./db/db');

// init express
const app = new express();
const port = 3001;
const db = new Database('./db/ticket.db');

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

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
