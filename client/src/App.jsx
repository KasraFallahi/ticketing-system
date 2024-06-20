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
	coursesContext,
	studentContext,
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

	/**
	 * Information about the currently logged in student.
	 * This is undefined when no student is logged in
	 */
	const [user, setUser] = useState(undefined);

	/** The list of tickets */
	const [tickets, setTickets] = useState([]);

	useEffect(() => {
		// Load the list of courses and number of students enrolled from the server
		Promise.all(API.fetchCourses())
			.then((res) => {
				const c = res[0]; // Tickets

				setTickets(
					c.map(
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

				// Loading done
				setLoading(false);
			})
			.catch((err) => setErrors(err));
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
				{/* <Route
					path=""
					element={
						loading ? (
							<LoadingSpinner />
						) : (
							<HomePage
								student={student}
								courses={courses}
								spActivities={spActivities}
								errorAlertActive={errors.length > 0}
								waiting={waiting}
							/>
						)
					}
				/> */}
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
