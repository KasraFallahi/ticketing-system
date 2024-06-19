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
			'SELECT ticket_id, state, category, owner, title, initial_text, submitted_at FROM tickets ORDER BY submitted_at DESC'
		);
		return tickets;
	};
}

module.exports = Database;
