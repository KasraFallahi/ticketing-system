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
		// Retrieve the tickets
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
				users.name AS owner,
				tickets.owner AS owner_id
			FROM 
				tickets
			JOIN 
				users ON tickets.owner = users.user_id
			ORDER BY 
				tickets.submitted_at DESC;
			`
		);

		// Retrieve text_blocks for each ticket
		for (let ticket of tickets) {
			const textBlocks = await dbAllAsync(
				this.db,
				`
				SELECT 
					text_blocks.text_block_id,
					text_blocks.text,
					users.name AS author,
					text_blocks.submitted_at
				FROM 
					text_blocks
				JOIN
					users ON text_blocks.author = users.user_id
				WHERE 
					text_blocks.ticket_id = ?;
				`,
				[ticket.ticket_id]
			);
			// Add the textBlocks array to the ticket object
			ticket.text_blocks = textBlocks;
		}

		return tickets;
	};

	/**
	 * Create a new study plan for the specified student.
	 * This function assumes the input to be correct, please validate it beforehand with 'checkStudyPlan'.
	 *
	 * @param userId id of the student
	 *
	 * @returns a Promise that resolves to nothing on success
	 */
	this.createTicket = async (ticket, userId) => {
		const sql =
			'INSERT INTO tickets (owner, category, title, initial_text) VALUES (?, ?, ?, ?)';
		const params = [userId, ticket.category, ticket.title, ticket.description];
		await dbRunAsync(this.db, sql, params);
	};

	/**
	 * Change the state of a ticket
	 *
	 * @param ticketId ID of the ticket to update
	 * @param newState New state of the ticket (either "Open" or "Closed")
	 * @param userId ID of the user making the change (to verify ownership)
	 *
	 * @returns a Promise that resolves to nothing on success
	 */
	this.updateTicketState = async (ticketId, newState) => {
		const sql = `
		UPDATE tickets
		SET state = ?
		WHERE ticket_id = ?
	`;
		const params = [newState, ticketId];
		await dbRunAsync(this.db, sql, params);
	};

	/**
	 * Update the category of a ticket
	 *
	 * @param ticketId ID of the ticket to update
	 * @param category New category of the ticket
	 *
	 * @returns a Promise that resolves when the update is complete
	 */
	this.updateTicketCategory = async (ticketId, category) => {
		const sql = 'UPDATE tickets SET category = ? WHERE ticket_id = ?';
		const params = [category, ticketId];
		await dbRunAsync(this.db, sql, params);
	};

	/**
	 * Add a text block to a ticket
	 *
	 * @param ticketId ID of the ticket to add the text block to
	 * @param userId ID of the user adding the text block
	 * @param text Text of the text block
	 *
	 * @returns a Promise that resolves to nothing on success
	 */
	this.addTextBlock = async (ticketId, userId, text) => {
		const sql = `
		INSERT INTO text_blocks (ticket_id, author, text)
		VALUES (?, ?, ?)
	`;
		const params = [ticketId, userId, text];
		await dbRunAsync(this.db, sql, params);
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
								is_admin: user.is_admin,
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
