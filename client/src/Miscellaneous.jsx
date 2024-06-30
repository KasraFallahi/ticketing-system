import { createContext, useEffect } from 'react';
import {
	Alert,
	Button,
	Container,
	Nav,
	Navbar,
	OverlayTrigger,
	Tooltip,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

/** Context used to propagate the list of tickets */
const ticketsContext = createContext();

/** Context used to propagate the user object */
const userContext = createContext();

/** Context used to propagate all the ticket related functions */
const ticketActionsContext = createContext();

/** Context used to propagate the waiting state to everything that might need it */
const waitingContext = createContext();

/**
 * The navigation bar at the top of the app.
 * This is meant to be inserted as a parent route to pretty much the entire app
 *
 * @param props.user object with all the currently logged in user's info
 */
function MyNavbar(props) {
	const navigate = useNavigate();

	return (
		<>
			<Navbar
				className="shadow"
				fixed="top"
				bg="light"
				style={{ marginBottom: '2rem' }}
			>
				<Container>
					<Navbar.Brand
						href="/"
						onClick={(event) => {
							event.preventDefault();
							navigate('/');
						}}
					>
						<i className="bi bi-card-list" /> Ticketing System
					</Navbar.Brand>
					<Nav>
						{props.user ? (
							<Navbar.Text>
								Logged in as: {props.user.name} |{' '}
								<a
									href="/logout"
									onClick={(event) => {
										event.preventDefault();
										props.logoutCbk();
									}}
								>
									Logout
								</a>
							</Navbar.Text>
						) : (
							<Nav.Link
								href="/login"
								active={false}
								onClick={(event) => {
									event.preventDefault();
									navigate('/login');
								}}
							>
								Login <i className="bi bi-person-fill" />
							</Nav.Link>
						)}
					</Nav>
				</Container>
			</Navbar>
		</>
	);
}

/**
 * Informs the user that the route is not valid
 */
function NotFoundPage() {
	return (
		<>
			<div style={{ textAlign: 'center', paddingTop: '5rem' }}>
				<h1>
					<i className="bi bi-exclamation-circle-fill" /> The page cannot be
					found <i className="bi bi-exclamation-circle-fill" />
				</h1>
				<br />
				<p>
					The requested page does not exist, please head back to the{' '}
					<Link to={'/'}>app</Link>.
				</p>
			</div>
		</>
	);
}

/**
 * Bootstrap's Alert component used to show errors
 *
 * @param props.errors list of error strings to show
 * @param props.clear callback to clear all errors
 */
function ErrorsAlert(props) {
	useEffect(() => {
		const timer = setTimeout(() => {
			props.clear();
		}, 5000); // Adjust the duration as needed (5000ms = 5 seconds)

		return () => clearTimeout(timer);
	}, [props]);

	return (
		<Alert
			variant="danger"
			dismissible
			onClose={props.clear}
			style={{ margin: '2rem', marginTop: '6rem' }}
		>
			{props.errors.length === 1
				? props.errors[0]
				: [
						'Errors: ',
						<br key="br" />,
						<ul key="ul">
							{props.errors.map((e, i) => (
								<li key={i + ''}>{e}</li>
							))}
						</ul>,
				  ]}
		</Alert>
	);
}

/**
 * Bootstrap's Alert component used to show success messages
 *
 * @param props.message the success message to show
 * @param props.clear callback to clear the success message
 */
function SuccessAlert(props) {
	useEffect(() => {
		const timer = setTimeout(() => {
			props.clear();
		}, 5000); // Adjust the duration as needed (5000ms = 5 seconds)

		return () => clearTimeout(timer);
	}, [props]);

	return (
		<Alert
			variant="success"
			dismissible
			onClose={props.clear}
			style={{ margin: '2rem', marginTop: '6rem' }}
		>
			{props.message}
		</Alert>
	);
}

/**
 * Exactly what you may expect.
 *
 * @param props.inner contents of the button
 * @param props.variant variant of the bootstrap Button
 * @param props.tooltip text to show on hover. Disabled if empty
 * @param props.disabled whether the button is disabled or not
 * @param props.onClick callback on click of the button
 */
function SmallRoundButton(props) {
	const button = (
		<Button
			variant={props.variant}
			disabled={props.disabled}
			className="rounded-pill"
			onClick={props.onClick}
			style={{
				width: '30px',
				height: '30px',
				textAlign: 'center',
				padding: '0px',
			}}
		>
			{props.inner}
		</Button>
	);

	if (props.tooltip) {
		return (
			<OverlayTrigger
				placement="top"
				overlay={<Tooltip id={'tooltip2'}>{props.tooltip}</Tooltip>}
			>
				<div>
					{
						/* The div allows the tooltip to be shown on disabled buttons */ button
					}
				</div>
			</OverlayTrigger>
		);
	} else {
		return button;
	}
}

export {
	MyNavbar,
	NotFoundPage,
	ErrorsAlert,
	SuccessAlert,
	ticketsContext,
	userContext,
	ticketActionsContext,
	waitingContext,
	SmallRoundButton,
};
