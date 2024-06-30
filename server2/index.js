'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret =
	'47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';

// init express
const app = express();
const port = 3002;

const corsOptions = {
	origin: 'http://localhost:5173',
	credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

app.use(
	jwt({
		secret: jwtSecret,
		algorithms: ['HS256'],
		// token from HTTP Authorization: header
	})
);

// To return a better object in case of errors
app.use(function (err, req, res, next) {
	console.log('err: ', err);
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({
			errors: [{ param: 'Server', msg: 'Authorization error', path: err.code }],
		});
	} else {
		next();
	}
});

/*** APIs ***/

// POST /api/estimate-time
app.post('/api/estimate-time', (req, res) => {
	const { title, category, is_admin } = req.body;

	if (!title || !category) {
		return res
			.status(400)
			.json({ errors: ['Title and category are required'] });
	}

	const titleLength = title.replace(/\s+/g, '').length;
	const categoryLength = category.replace(/\s+/g, '').length;
	const totalLength = titleLength + categoryLength;

	const baseEstimate = totalLength * 10;
	const randomHours = Math.floor(Math.random() * 240) + 1;
	const estimatedHours = baseEstimate + randomHours;

	if (is_admin === 1) {
		res.json({ estimatedHours });
	} else {
		const estimatedDays = Math.round(estimatedHours / 24);
		res.json({ estimatedDays });
	}
});

/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
