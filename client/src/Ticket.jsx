/**
 * The Ticket type, used throughout the app.
 * This is a constructor function, meant to be called with "new".
 *
 * @param ticket_id the ticket ID, a unique identifier for the ticket
 * @param state the state of the ticket (e.g. open, closed)
 * @param category the category of the ticket (e.g. bug, feature request)
 * @param title the title of the ticket
 * @param initial_text the initial text of the ticket
 * @param submitted_at the timestamp when the ticket was submitted
 */
function Ticket(
	ticket_id,
	state,
	category,
	title,
	initial_text,
	submitted_at,
	owner,
	text_blocks
) {
	this.ticket_id = ticket_id;
	this.state = state;
	this.category = category;
	this.title = title;
	this.initial_text = initial_text;
	this.submitted_at = submitted_at;
	this.owner = owner;
	this.text_blocks = text_blocks;
}

export { Ticket };
