'use strict';

const sqlite = require('sqlite3');
const crypto = require('crypto');

/**
 * Wrapper around db.all
 */
const dbAllAsync = (db, sql, params = []) =>
	new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});

/**
 * Wrapper around db.run
 */
const dbRunAsync = (db, sql, params = []) =>
	new Promise((resolve, reject) => {
		db.run(sql, params, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (db, sql, params = []) =>
	new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});

/**
 * Interface to the sqlite database for the application
 *
 * @param dbname name of the sqlite3 database file to open
 */
function Database(dbname) {
	this.db = new sqlite.Database(dbname, (err) => {
		if (err) throw err;
	});

	/**
	 * Retrieve the list of all courses from the db
	 *
	 * @returns a Promise that resolves to the list of course
	 *          objects as: {code, name, cfu, incompat: [...], (mandatory), (maxStudents)}
	 */
	this.getTickets = async () => {
		// Note: perform the conversion from the db "max_students" to js' "maxStudents" in the SQL query
		const tickets = await dbAllAsync(
			this.db,
			`
			SELECT 
			 	tickets.ticket_id,
			 	tickets.state,
			 	tickets.category,
			 	tickets.title,
			 	tickets.initial_text,
			 	tickets.submitted_at,
			 	users.name AS owner
			FROM 
			 	tickets
			JOIN 
				users ON tickets.owner = users.user_id
			ORDER BY 
				tickets.submitted_at DESC;
			`
		);
		// .map(c => ({...c, incompat: []})); // Add incompat list
		// const incompats = await dbAllAsync(this.db, 'select * from incompats');

		// for (const { course, incompat } of incompats) {
		// 	// Append incompatibility to the correct course
		// 	const main = tickets.find((c) => c.code === course);
		// 	if (!main) throw 'DB inconsistent';

		// 	main.incompat.push(incompat);
		// }

		return tickets;
	};

	/**
	 * Authenticate a user from their email and password
	 *
	 * @param email email of the user to authenticate
	 * @param password password of the user to authenticate
	 *
	 * @returns a Promise that resolves to the user object {id, username, name, fullTime}
	 */
	this.authUser = (email, password) =>
		new Promise((resolve, reject) => {
			// Get the student with the given email
			dbGetAsync(this.db, 'SELECT * FROM users WHERE email = ?', [email])
				.then((user) => {
					// If there is no such user, resolve to false.
					// This is used instead of rejecting the Promise to differentiate the
					// failure from database errors
					if (!user) resolve(false);

					// Verify the password
					crypto.scrypt(password, user.salt, 32, (err, hash) => {
						if (err) reject(err);

						if (crypto.timingSafeEqual(hash, Buffer.from(user.hash, 'hex')))
							resolve({
								id: user.user_id,
								username: user.email,
								name: user.name,
							});
						// Avoid full_time = null being cast to false
						else resolve(false);
					});
				})
				.catch((e) => reject(e));
		});

	/**
	 * Retrieve the student with the specified id
	 *
	 * @param id the id of the student to retrieve
	 *
	 * @returns a Promise that resolves to the user object {id, username, name, fullTime}
	 */
	this.getUser = async (id) => {
		const user = await dbGetAsync(
			this.db,
			'SELECT email as username, name FROM users WHERE user_id = ?',
			[id]
		);

		return { ...user, id };
	};
}

module.exports = Database;
