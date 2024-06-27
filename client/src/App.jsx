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
	MyNavbar,
	ticketsContext,
	userContext,
	spActivitiesContext,
	checkStudyPlanModified,
	waitingContext,
	NotFoundPage,
} from './Miscellaneous';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
// import './App.css';
import { API } from './API';
import { Ticket } from './Ticket';
import { TicketList } from './TicketList';
import { LoginForm } from './LoginForm';
import { CreateTicketForm } from './CreateTicketForm';

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

	/** A list of errors */
	const [errors, setErrors] = useState([]);

	/** Network-related waiting, like after pressing save or delete study plan. When waiting all controls are disabled. */
	const [waiting, setWaiting] = useState(false);

	/**
	 * Information about the currently logged in student.
	 * This is undefined when no student is logged in
	 */
	const [user, setUser] = useState(undefined);

	const [authToken, setAuthToken] = useState(undefined);

	/** The list of tickets */
	const [tickets, setTickets] = useState([]);

	useEffect(() => {
		// Load the list of tickets
		API.fetchTickets()
			.then((res) => {
				setTickets(
					res.map(
						(ticket) =>
							new Ticket(
								ticket.ticket_id,
								ticket.state,
								ticket.category,
								ticket.title,
								ticket.initial_text,
								ticket.submitted_at,
								ticket.owner
							)
					)
				);
				// Loading done
				setLoading(false);
			})
			.catch((err) => {
				setErrors(err);
				console.log(err);
			});

		// Check if the user was already logged in
		API.fetchCurrentUser()
			.then((user) => {
				setUser(user);
				API.getAuthToken().then((res) => setAuthToken(res.token));
			})
			.catch((err) => {
				// Remove eventual 401 Unauthorized errors from the list, those are expected
				setErrors(err.filter((e) => e !== 'Not authenticated'));
			});
	}, []);

	useEffect(() => {
		if (user) {
			// authentication has already taken place
			API.getAuthToken()
				.then((res) => {
					setAuthToken(res.token);
					setUser((user) => ({ ...user }));
				})
				.catch(() => {}); // This should not happen: token has just been requested
		}
		// Every time the study plan (as stored on the server) changes, ask the average success rate to server2
		// Using an array reference here in this very particular case would be safe since the array is recreated
		// because it is part of a state set after loading from server
		// So, [savedStudyPlan?.courses] could be used as a dependency.

		// To avoid problems, however, a value (string) derived from the array is used here.
		// Note that .length would not work because the length of the old and the new one can be the same but with different content

		// Alternatively, not recommended because you may risk forgetting to update it:
		// use an additional state variable (flag), to be set every time courses changes
	}, []);

	/**
	 * Refetches dynamic content (number of students per course and study plan info)
	 *
	 * @returns a Promise that resolves when the refetch is complete
	 */
	const refetchDynamicContent = async () => {
		try {
			// Fetch user's info
			const user = await API.fetchCurrentUser();
			setUser(user);

			// Load the list of tickets
			const tickets = await API.fetchTickets();
			setTickets(
				tickets.map(
					(ticket) =>
						new Ticket(
							ticket.ticket_id,
							ticket.state,
							ticket.category,
							ticket.title,
							ticket.initial_text,
							ticket.submitted_at,
							ticket.owner
						)
				)
			);
			// Loading done
			setLoading(false);
		} catch (err) {
			// Remove eventual 401 Unauthorized errors from the list, those are expected
			setErrors(err.filter((e) => e !== 'Not authenticated'));
		}
	};

	/**
	 * Perform the login
	 *
	 * @param email email of the student
	 * @param password password of the student
	 * @param onFinish optional callback to be called on login success or fail
	 */
	const login = async (email, password, onFinish) => {
		try {
			await API.login(email, password);
			setErrors([]);
			await refetchDynamicContent();
			navigate('/');
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
				// setSavedStudyPlan(undefined);
				setAuthToken(undefined);
				navigate('/');
			})
			.catch((err) => {
				// Remove eventual 401 Unauthorized errors from the list
				setErrors(err.filter((e) => e !== 'Not authenticated'));
			});
	};

	const createTicket = (ticketData, onFinish) => {
		API.createTicket(ticketData)
			.then(() => {
				setErrors([]);
				refetchDynamicContent().then(() => {
					navigate('/');
				});
			})
			.catch((err) => setErrors(err))
			.finally(() => onFinish?.());
	};

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
								createTicketCbk={createTicket}
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
			</userContext.Provider>
		</ticketsContext.Provider>
	);
}

/**
 * Header of the page, containing the navbar and, potentially, the error alert
 *
 * @param props.errors current list of error strings
 * @param props.clearErrors callback to clear all errors
 * @param props.student object with all the currently logged in user's info
 * @param props.logoutCbk callback to perform the user's logout
 */
function Header(props) {
	return (
		<>
			<MyNavbar user={props.user} logoutCbk={props.logoutCbk} />
			{props.errors.length > 0 ? (
				<ErrorsAlert errors={props.errors} clear={props.clearErrors} />
			) : (
				false
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
