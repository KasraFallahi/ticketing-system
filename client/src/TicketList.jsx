import { useContext, useState } from 'react';
import {
	Accordion,
	Badge,
	Col,
	Container,
	Row,
	Button,
	ListGroup,
	Form,
	Spinner,
	Card,
} from 'react-bootstrap';
import {
	ticketsContext,
	ticketActionsContext,
	userContext,
} from './Miscellaneous';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

/**
 * List of all the tickets.
 * Receives the list of all tickets from a Context
 */
function TicketList() {
	const user = useContext(userContext);
	const tickets = useContext(ticketsContext);
	const navigate = useNavigate();

	return (
		<>
			{/* Title and Create New Button */}
			<Row className="mb-3">
				<Col>
					<h5>All Tickets</h5>
				</Col>
				{user && (
					<Col className="text-end">
						<Button
							variant="primary"
							onClick={(event) => {
								event.preventDefault();
								navigate('/create-ticket');
							}}
						>
							<i className="bi bi-plus-lg me-1"></i>
							Create New
						</Button>
					</Col>
				)}
			</Row>
			<Container
				style={{
					paddingTop: '1rem',
					paddingBottom: '0.5rem',
					paddingRight: '1.5rem',
					paddingLeft: '0.5rem',
				}}
			>
				{/* Table Header */}
				<Row>
					<Col className="text-start" md={4} style={{ paddingLeft: '2.5rem' }}>
						Title
					</Col>
					<Col md={2} className="text-start" style={{ paddingLeft: '1.5rem' }}>
						{user && user.is_admin === 1 ? 'Est. Closure Time' : 'Category'}
					</Col>
					<Col md={2} className="text-center">
						Owner
					</Col>
					<Col md={2} className="text-start">
						State
					</Col>
					<Col md={2} className="text-start">
						Date Created
					</Col>
				</Row>
			</Container>
			{user ? (
				<Accordion alwaysOpen>
					{tickets.map((ticket) => (
						<TicketItem key={ticket.ticket_id} ticket={ticket} />
					))}
				</Accordion>
			) : (
				<Container>
					{tickets.map((ticket) => (
						<GeneralTicketItem key={ticket.ticket_id} ticket={ticket} />
					))}
				</Container>
			)}
		</>
	);
}

/**
 * TicketItem component.
 * Displays a single ticket with functionalities for editing by logged-in users.
 *
 * @param {Object} ticket The ticket object to display.
 */
function TicketItem({ ticket }) {
	const user = useContext(userContext);

	return (
		<Row key={ticket.ticket_id} className="align-items-center">
			<Col>
				<Accordion.Item eventKey={ticket.ticket_id}>
					<Accordion.Header>
						<Container>
							<Row className="align-items-center">
								<Col
									className="text-start"
									md={4}
									style={{ paddingLeft: '1rem' }}
								>
									<em style={{ color: 'black', fontWeight: 'bold' }}>
										{ticket.title}
									</em>
								</Col>
								<Col md={2} className="text-center d-flex align-items-center">
									{user && user.is_admin === 1 ? (
										<>
											{/* TODO change to actual value of estimated time */}2
											days
										</>
									) : (
										ticket.category
									)}
								</Col>
								<Col md={2} className="text-center">
									{ticket.owner}
								</Col>
								<Col md={2} className="text-start">
									<Badge bg={ticket.state === 'Closed' ? 'success' : 'warning'}>
										{ticket.state}
									</Badge>
								</Col>
								<Col md={2} className="text-start">
									{ticket.submitted_at}
								</Col>
							</Row>
						</Container>
					</Accordion.Header>
					<Accordion.Body>
						<TicketItemDetails ticket={ticket} />
					</Accordion.Body>
				</Accordion.Item>
			</Col>
		</Row>
	);
}

/**
 * GeneralTicketItem component.
 * Displays a single ticket as a card without any user-related functionalities for generic visitors.
 *
 * @param {Object} ticket The ticket object to display.
 */
function GeneralTicketItem({ ticket }) {
	return (
		<Card className="mb-3">
			<Card.Body>
				<Container>
					<Row className="align-items-center">
						<Col md={4} className="text-start" style={{ paddingLeft: '1rem' }}>
							<em style={{ color: 'black', fontWeight: 'bold' }}>
								{ticket.title}
							</em>
						</Col>
						<Col md={2} className="text-start">
							{ticket.category}
						</Col>
						<Col md={2} className="text-center">
							{ticket.owner}
						</Col>
						<Col md={2} className="text-start">
							<Badge bg={ticket.state === 'Closed' ? 'success' : 'warning'}>
								{ticket.state}
							</Badge>
						</Col>
						<Col md={2} className="text-start">
							{ticket.submitted_at}
						</Col>
					</Row>
				</Container>
			</Card.Body>
		</Card>
	);
}

/**
 * Details for the TicketItem.
 * This is shown when the corresponding ticket's row is clicked
 *
 * @param props.ticket the ticket the details of which are to be rendered
 */
function TicketItemDetails(props) {
	const user = useContext(userContext);
	const ticketActions = useContext(ticketActionsContext);
	const [newTextBlock, setNewTextBlock] = useState('');
	const [textBlockError, setTextBlockError] = useState('');
	const [waiting, setWaiting] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();

		// Validate form
		const trimmedTextBlock = newTextBlock.trim();
		const textBlockError = validator.isEmpty(trimmedTextBlock)
			? 'Text block must not be empty'
			: '';

		if (!textBlockError) {
			setWaiting(true);
			ticketActions.addTextBlock(props.ticket.ticket_id, newTextBlock, () =>
				setWaiting(false)
			);
			setNewTextBlock('');
		} else {
			setTextBlockError(textBlockError);
		}
	};

	return (
		<Container>
			<TicketActions
				user={user}
				ticket={props.ticket}
				handleSubmit={handleSubmit}
				waiting={waiting}
				setWaiting={setWaiting}
			/>
			<TextBlockList textBlocks={props.ticket.text_blocks} />
			{user && user.is_admin === 1 && (
				<AdminCategoryEdit
					ticket={props.ticket}
					waiting={waiting}
					setWaiting={setWaiting}
				/>
			)}
			{user && props.ticket.state === 'Open' && (
				<Form onSubmit={handleSubmit} className="mx-3 mt-3">
					<Form.Group controlId="newTextBlock">
						<Form.Label>Add Reply</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							value={newTextBlock}
							isInvalid={!!textBlockError}
							onChange={(e) => {
								setNewTextBlock(e.target.value);
								setTextBlockError('');
							}}
							placeholder="Type your reply here..."
						/>
						<Form.Control.Feedback type="invalid">
							{textBlockError}
						</Form.Control.Feedback>
					</Form.Group>
					<Button
						type="submit"
						variant="primary"
						className="mt-2"
						disabled={waiting}
					>
						{waiting ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>{' '}
							</>
						) : (
							'Submit Reply'
						)}
					</Button>
				</Form>
			)}
		</Container>
	);
}

/**
 * Component to render the list of text blocks
 *
 * @param {Array} textBlocks The list of text blocks to render
 */
function TextBlockList({ textBlocks }) {
	return (
		<ListGroup className="mx-3 mt-3">
			{textBlocks.map((text_block) => (
				<ListGroup.Item
					key={text_block.text_block_id}
					className="mb-3 border-0 px-0"
				>
					<Row>
						<Col xs="auto" className="d-flex flex-column align-items-start">
							<i
								className="bi bi-person-circle"
								style={{ fontSize: '2rem' }}
							></i>
						</Col>
						<Col className="ps-2">
							<div className="fw-bold">{text_block.author}</div>
							<div className="text-muted">{text_block.submitted_at}</div>
							<div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>
								{text_block.text}
							</div>
						</Col>
					</Row>
				</ListGroup.Item>
			))}
		</ListGroup>
	);
}

/**
 * Component for admin users to edit the ticket category
 *
 * @param {Object} ticket The ticket object to edit
 * @param {Boolean} waiting If the action is in progress
 * @param {Function} setWaiting Function to set the waiting state
 */
function AdminCategoryEdit({ ticket, waiting, setWaiting }) {
	const ticketActions = useContext(ticketActionsContext);
	const [category, setCategory] = useState(ticket.category);
	const [initialCategory] = useState(ticket.category);
	const [showSaveButton, setShowSaveButton] = useState(false);

	const handleCategoryChange = (e) => {
		const newCategory = e.target.value;
		setCategory(newCategory);
		setShowSaveButton(newCategory !== initialCategory);
	};

	const handleSelectClick = (e) => {
		e.stopPropagation();
	};

	const handleSaveCategory = () => {
		setWaiting(true);
		ticketActions.editTicketCategory(ticket.ticket_id, category, () => {
			setWaiting(false);
			setShowSaveButton(false);
		});
	};

	return (
		<div className="d-flex align-items-center mx-3 mt-3">
			<Form.Select
				value={category}
				onChange={handleCategoryChange}
				onClick={handleSelectClick}
				disabled={waiting}
				size="md"
				style={{ marginRight: '10px' }} // Add margin for spacing
			>
				<option value="inquiry">Inquiry</option>
				<option value="maintenance">Maintenance</option>
				<option value="new feature">New Feature</option>
				<option value="administrative">Administrative</option>
				<option value="payment">Payment</option>
			</Form.Select>
			{showSaveButton && (
				<Button
					variant="success"
					onClick={handleSaveCategory}
					disabled={waiting}
					className="d-flex align-items-center justify-content-center"
					style={{
						height: '38px', // Set height same as Select component
					}}
				>
					{waiting ? (
						<Spinner
							as="span"
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
						/>
					) : (
						'Save'
					)}
				</Button>
			)}
		</div>
	);
}

/**
 * Component to render ticket actions like close and reopen
 *
 * @param {Object} user The current logged-in user
 * @param {Object} ticket The ticket object
 * @param {Function} handleSubmit Function to handle form submit
 * @param {Boolean} waiting If the action is in progress
 * @param {Function} setWaiting Function to set the waiting state
 */
function TicketActions({ user, ticket, waiting, setWaiting }) {
	const ticketActions = useContext(ticketActionsContext);
	const handleCloseTicket = () => {
		if (window.confirm('Are you sure you want to close this ticket?')) {
			setWaiting(true);
			ticketActions.editTicketState(ticket.ticket_id, 'Closed', () =>
				setWaiting(false)
			);
		}
	};

	const handleReopenTicket = () => {
		if (window.confirm('Are you sure you want to re-open this ticket?')) {
			setWaiting(true);
			ticketActions.editTicketState(ticket.ticket_id, 'Open', () =>
				setWaiting(false)
			);
		}
	};

	return (
		<div className="d-flex justify-content-between align-items-center">
			<p className="mb-0">{ticket.initial_text}</p>
			{user &&
				user.is_admin === 1 &&
				(ticket.state === 'Open' ? (
					<Button
						variant="danger"
						onClick={handleCloseTicket}
						disabled={waiting}
					>
						{waiting ? (
							<Spinner
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
							/>
						) : (
							<i className="bi bi-x-circle me-2" />
						)}
						Close Ticket
					</Button>
				) : (
					<Button
						variant="primary"
						onClick={handleReopenTicket}
						disabled={waiting}
					>
						{waiting ? (
							<Spinner
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
							/>
						) : (
							<i className="bi bi-arrow-clockwise me-2" />
						)}
						Re-open Ticket
					</Button>
				))}
			{ticket.state === 'Open' && user && user.id === ticket.owner_id && (
				<Button variant="danger" onClick={handleCloseTicket} disabled={waiting}>
					{waiting ? (
						<Spinner
							as="span"
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
						/>
					) : (
						<i className="bi bi-x-circle me-2" />
					)}
					Close Ticket
				</Button>
			)}
		</div>
	);
}

export { TicketList };
