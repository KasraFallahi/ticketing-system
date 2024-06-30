import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import {
	BrowserRouter,
	Routes,
	Route,
	Outlet,
	useNavigate,
} from 'react-router-dom';
import {
	ErrorsAlert,
	SuccessAlert,
	MyNavbar,
	ticketsContext,
	userContext,
	ticketActionsContext,
	waitingContext,
	NotFoundPage,
} from './Miscellaneous';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { API } from './API';
import { Ticket } from './Ticket';
import { LoginForm } from './LoginForm';
import { CreateTicketForm } from './CreateTicketForm';
import TicketList from './TicketList';

function App() {
	return (
		<BrowserRouter>
			<Main />
		</BrowserRouter>
	);
}

/**
 * The actual main app.
 * This is used instead of the default App component because Main can be encapsulated in
 * a BrowserRouter component, giving it the possibility of using the useNavigate hook.
 */
function Main() {
	const navigate = useNavigate();

	/** Flags initial loading of the app */
	const [loading, setLoading] = useState(true);

	/** A list of error messages */
	const [errors, setErrors] = useState([]);

	/** A list of success messages */
	const [success, setSuccess] = useState('');

	/** Network-related waiting, like after pressing save or delete study plan. When waiting all controls are disabled. */
	const [waiting, setWaiting] = useState(false);

	/**
	 * Information about the currently logged in student.
	 * This is undefined when no student is logged in
	 */
	const [user, setUser] = useState(undefined);

	const [authToken, setAuthToken] = useState(null);

	const [tokenExpiration, setTokenExpiration] = useState(null);

	/** The list of tickets */
	const [tickets, setTickets] = useState([]);

	/** State of new tickets added */
	const [newTickets, setnewTickets] = useState(false);

	useEffect(() => {
		const fetchTicketsWithEstimates = async () => {
			try {
				// Load the list of tickets
				const res = await API.fetchTickets();
				const tickets = res.map(
					(ticket) =>
						new Ticket(
							ticket.ticket_id,
							ticket.state,
							ticket.category,
							ticket.title,
							ticket.initial_text,
							ticket.submitted_at,
							ticket.owner,
							ticket.text_blocks,
							ticket.owner_id,
							null // Placeholder for est_closure
						)
				);

				if (user && user.is_admin === 1) {
					// Extract titles and categories for estimation
					const ticketData = tickets.map((ticket) => ({
						title: ticket.title,
						category: ticket.category,
					}));

					// Ensure token is valid
					let currentAuthToken = authToken;
					if (!authToken || Date.now() >= tokenExpiration) {
						const response = await API.getAuthToken();
						currentAuthToken = response.token;
						setAuthToken(currentAuthToken);
						setTokenExpiration(Date.now() + 60000); // Set expiration time to 60 seconds
					}

					// Fetch estimated times
					const estimatedTimesResponse = await API.getEstimatedTimes(
						currentAuthToken,
						ticketData
					);
					const ticketsWithEstimates = tickets.map((ticket, index) => ({
						...ticket,
						estClosure: estimatedTimesResponse[index].estimatedHours,
					}));

					setTickets(ticketsWithEstimates);
				} else {
					setTickets(tickets);
				}
			} catch (err) {
				setErrors(err);
				console.log(err);
			} finally {
				// Loading done
				setLoading(false);
			}
		};

		fetchTicketsWithEstimates();
	}, [authToken, tokenExpiration, user]);

	useEffect(() => {
		if (tokenExpiration) {
			const timeoutId = setTimeout(() => {
				setAuthToken(null);
				setTokenExpiration(null);
			}, 60000);

			// Clean up the timeout if the component unmounts or the expiration time changes
			return () => clearTimeout(timeoutId);
		}
	}, [tokenExpiration]);

	/**
	 * Perform the login
	 *
	 * @param email email of the student
	 * @param password password of the student
	 * @param onFinish optional callback to be called on login success or fail
	 */
	const login = async (email, password, onFinish) => {
		try {
			const fetchetUser = await API.login(email, password);
			setUser(fetchetUser);
			setErrors([]);
			// Loading done
			setLoading(false);
			setnewTickets(true);
			navigate('/');
		} catch (err) {
			setErrors(err);
		} finally {
			onFinish?.();
		}
	};

	/**
	 * Fetch the JWT token
	 *
	 * @param onFinish optional callback to be called on fetch token success or fail
	 */
	const fetchAuthToken = async (onFinish) => {
		try {
			const response = await API.getAuthToken();
			setAuthToken(response.token);
			setTokenExpiration(Date.now() + 60000); // Set expiration time to 60 seconds
			setErrors([]);
			// Loading done
			setLoading(false);
			return response.token;
		} catch (err) {
			setErrors(err);
		} finally {
			onFinish?.();
		}
	};

	/**
	 * Perform the logout
	 */
	const logout = () => {
		API.logout()
			.then(() => {
				setUser(undefined);
				setAuthToken(undefined);
				navigate('/');
				setnewTickets(true);
			})
			.catch((err) => {
				// Remove eventual 401 Unauthorized errors from the list
				setErrors(err.filter((e) => e !== 'Not authenticated'));
			})
			.finally(() => setLoading(false));
	};

	const createTicket = (ticketData, onFinish) => {
		API.createTicket(ticketData)
			.then(() => {
				setErrors([]);
				setSuccess('Ticket submitted successfully');
				// Loading done
				setLoading(false);
				setnewTickets(true);
				navigate('/');
			})
			.catch((err) => setErrors(err))
			.finally(() => onFinish?.());
	};

	/**
	 * Edit the state of an existing ticket
	 *
	 * @param ticketId ID of the ticket to edit
	 * @param newState New state of the ticket (either "Open" or "Closed")
	 * @param onFinish optional callback to be called on edit success or fail
	 */
	const editTicketState = (ticketId, newState, onFinish) => {
		setLoading(true);
		API.editTicketState(ticketId, newState)
			.then(() => {
				setErrors([]);
				setSuccess(`Ticket state changed to ${newState}`);
				navigate('/');
				setnewTickets(true);
			})
			.catch((err) => setErrors(err))
			.finally(async () => {
				onFinish?.();
				// Loading done
				setLoading(false);
			});
	};

	/**
	 * Edit the category of an existing ticket
	 *
	 * @param ticketId ID of the ticket to edit
	 * @param newCategory New category of the ticket
	 * @param onFinish optional callback to be called on edit success or fail
	 */
	const editTicketCategory = (ticketId, newCategory, onFinish) => {
		setLoading(true);
		API.editTicketCategory(ticketId, newCategory)
			.then(() => {
				setErrors([]);
				setSuccess(`Ticket category changed to ${newCategory}`);
				setnewTickets(true);
				navigate('/');
			})
			.catch((err) => setErrors(err))
			.finally(async () => {
				onFinish?.();
				// Loading done
				setLoading(false);
			});
	};

	/**
	 * Add a text block to a ticket
	 *
	 * @param ticketId ID of the ticket to add the text block to
	 * @param userId ID of the user adding the text block
	 * @param text Text of the text block
	 * @param onFinish optional callback to be called on success or fail
	 */
	const addTextBlock = (ticketId, text, onFinish) => {
		setLoading(true);
		API.addTextBlock(ticketId, text)
			.then(() => {
				setErrors([]);
				setSuccess('Your reply added successfully');
				setnewTickets(true);
				navigate('/');
			})
			.catch((err) => setErrors(err))
			.finally(async () => {
				onFinish?.();
				// Loading done
				setLoading(false);
			});
	};

	/**
	 * Fetch the estimated time to close a ticket
	 *
	 * @param title the title of the ticket
	 * @param category the category of the ticket
	 * @param onFinish optional callback to be called on success or fail
	 */
	const fetchEstimatedTime = async (title, category, onFinish) => {
		try {
			const currentAuthToken =
				!authToken || Date.now() >= tokenExpiration
					? await fetchAuthToken()
					: authToken;

			return await API.getEstimatedTime(
				currentAuthToken,
				title,
				category,
				user.is_admin
			);
		} catch (err) {
			setErrors(err);
		} finally {
			onFinish?.();
			// Loading done
			setLoading(false);
		}
	};

	const ticketActions = { editTicketState, editTicketCategory, addTextBlock };
	const ticketCreationActions = { createTicket, fetchEstimatedTime };

	return (
		<Routes>
			<Route
				path="/"
				element={
					<Header
						user={user}
						logoutCbk={logout}
						errors={errors}
						clearErrors={() => setErrors([])}
						success={success}
						clearSuccess={() => setSuccess('')}
					/>
				}
			>
				<Route
					path=""
					element={
						loading ? (
							<LoadingSpinner />
						) : (
							<HomePage
								user={user}
								tickets={tickets}
								errorAlertActive={errors.length > 0}
								waiting={waiting}
								ticketActions={ticketActions}
							/>
						)
					}
				/>
				<Route
					path="login"
					element={
						loading ? (
							<LoadingSpinner />
						) : (
							<LoginForm
								loginCbk={login}
								errorAlertActive={errors.length > 0}
							/>
						)
					}
				/>
				<Route
					path="create-ticket"
					element={
						loading ? (
							<LoadingSpinner />
						) : (
							<CreateTicketForm
								ticketCreationActions={ticketCreationActions}
								errorAlertActive={errors.length > 0}
							/>
						)
					}
				/>
			</Route>
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}

/**
 * Proper home page component of the app
 *
 * @param props.courses list of all the Course objects
 * @param props.student object with all the currently logged in student's info
 * @param props.spActivities object with all the study plan related functions
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 * @param props.waiting boolean, when true all controls should be disabled
 */
function HomePage(props) {
	return (
		<ticketsContext.Provider value={props.tickets}>
			<userContext.Provider value={props.user}>
				<ticketActionsContext.Provider value={props.ticketActions}>
					<waitingContext.Provider value={props.waiting}>
						<Container
							fluid
							style={{
								paddingLeft: '2rem',
								paddingRight: '2rem',
								paddingBottom: '1rem',
								marginTop: props.errorAlertActive ? '2rem' : '6rem',
							}}
						>
							<Row className="justify-content-center">
								<Col lg style={{ maxWidth: '70%' }}>
									<TicketList />
								</Col>
							</Row>
						</Container>
					</waitingContext.Provider>
				</ticketActionsContext.Provider>
			</userContext.Provider>
		</ticketsContext.Provider>
	);
}

/**
 * Header of the page, containing the navbar and, potentially, the error alert
 *
 * @param props.errors current list of error strings
 * @param props.success current success message
 * @param props.user object with all the currently logged in user's info
 * @param props.logoutCbk callback to perform the user's logout
 */
function Header(props) {
	return (
		<>
			<MyNavbar user={props.user} logoutCbk={props.logoutCbk} />
			{props.errors.length > 0 && (
				<ErrorsAlert errors={props.errors} clear={props.clearErrors} />
			)}
			{props.success && (
				<SuccessAlert message={props.success} clear={props.clearSuccess} />
			)}
			<Outlet />
		</>
	);
}

/**
 * A loading spinner shown on first loading of the app
 */
function LoadingSpinner() {
	return (
		<div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
			<Spinner animation="border" role="status">
				<span className="visually-hidden">Loading...</span>
			</Spinner>
		</div>
	);
}

export default App;
