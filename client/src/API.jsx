const SERVER_HOST = 'http://localhost';
const SERVER_PORT = 3001;

const SERVER_BASE = `${SERVER_HOST}:${SERVER_PORT}/api/`;

/**
 * Generic API call
 *
 * @param endpoint API endpoint string to fetch
 * @param method HTTP method
 * @param body HTTP request body string
 * @param headers additional HTTP headers to be passed to 'fetch'
 * @param expectResponse wheter to expect a non-empty response body
 *
 * @returns whatever the specified API endpoint returns
 */
const APICall = async (
	endpoint,
	method = 'GET',
	body = undefined,
	headers = undefined,
	expectResponse = true,
	server_base_url = SERVER_BASE
) => {
	let errors = [];

	try {
		const response = await fetch(new URL(endpoint, server_base_url), {
			method,
			body,
			headers,
			credentials: 'include',
		});

		if (response.ok) {
			if (expectResponse) {
				return await response.json();
			}
		} else errors = (await response.json()).errors;
	} catch {
		const err = ['Failed to contact the server'];
		throw err;
	}

	if (errors.length !== 0) throw errors;
};

/**
 * Fetches all the courses from the server
 *
 * @returns list of courses
 */
const fetchTickets = async () => await APICall('tickets');

/**
 * Edits the state of a ticket
 *
 * @param ticketId ID of the ticket to edit
 * @param newState New state of the ticket (either "Open" or "Closed")
 *
 * @returns updated ticket response
 */
const editTicketState = async (ticketId, newState) =>
	await APICall(
		`ticket/${ticketId}`,
		'PATCH',
		JSON.stringify({ state: newState }),
		{ 'Content-Type': 'application/json' },
		false
	);

/**
 * Add a text block to a ticket
 *
 * @param ticketId ID of the ticket to add the text block to
 * @param text Text of the text block
 *
 * @returns a Promise that resolves to the response of the API call
 */
const addTextBlock = async (ticketId, text) =>
	await APICall(
		`ticket/${ticketId}/text-block`,
		'POST',
		JSON.stringify({ text }),
		{ 'Content-Type': 'application/json' },
		false
	);

/**
 * Attempts to login the student
 *
 * @param email email of the student
 * @param password password of the student
 */
const login = async (email, password) =>
	await APICall(
		'session',
		'POST',
		JSON.stringify({ username: email, password }),
		{ 'Content-Type': 'application/json' }
	);

/**
 * Logout.
 * This function can return a "Not authenticated" error if the student wasn't authenticated beforehand
 */
const logout = async () =>
	await APICall('session', 'DELETE', undefined, undefined, false);

/**
 * Fetches the currently logged in user's info
 */
const fetchCurrentUser = async () => await APICall('session/current');

/**
 * Fetches the token to access the second server
 */
const getAuthToken = async () =>
	await APICall('auth-token', 'GET', undefined, undefined, true);

const createTicket = async (ticketData) =>
	await APICall(
		'create-ticket',
		'POST',
		JSON.stringify(ticketData),
		{ 'Content-Type': 'application/json' },
		false
	);

const API = {
	fetchTickets,
	fetchCurrentUser,
	logout,
	login,
	getAuthToken,
	createTicket,
	editTicketState,
	addTextBlock,
};

export { API };
