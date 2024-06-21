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
import './App.css';
import { API } from './API';
import { Ticket } from './Ticket';
import { TicketList } from './TicketList';

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

	/** The list of tickets */
	const [tickets, setTickets] = useState([]);

	useEffect(() => {
		// Load the list of courses and number of students enrolled from the server
		API.fetchTickets()
			.then((res) => {
				console.log(res);
				setTickets(
					res.map(
						(ticket) =>
							new Ticket(
								ticket.ticket_id,
								ticket.state,
								ticket.category,
								ticket.title,
								ticket.initial_text,
								ticket.submitted_at
							)
					)
					// .sort((a, b) => a.name.localeCompare(b.name))
				);
				setLoading(false);
			})
			.catch((err) => {
				setErrors(err);
				console.log(err);
			});

		// Loading done
	}, []);

	return (
		<Routes>
			<Route
				path="/"
				element={
					<Header
						user={user}
						// logoutCbk={logout}
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
								// spActivities={spActivities}
								errorAlertActive={errors.length > 0}
								waiting={waiting}
							/>
						)
					}
				/>
				{/* <Route
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
				/> */}
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
							<Col
								lg
								style={{
									borderRight: props.user && '1px solid #dfdfdf',
									maxWidth: '70%',
								}}
							>
								<TicketList />
							</Col>
							{
								// If a user is logged in, show their study plan
								props.user ? <Col lg>{/* <StudyPlan /> */}</Col> : false
							}
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
 * @param props.student object with all the currently logged in student's info
 * @param props.logoutCbk callback to perform the student's logout
 */
function Header(props) {
	return (
		<>
			<MyNavbar
				user={props.user}
				// logoutCbk={props.logoutCbk}
			/>
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
