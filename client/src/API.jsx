const SERVER_HOST = 'http://127.0.0.1';
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
const fetchCourses = async () => await APICall('tickets');

const API = {
	fetchCourses,
};

export { API };
