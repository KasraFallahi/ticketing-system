import { useContext, useState } from 'react';
import {
	Accordion,
	Badge,
	Col,
	Container,
	OverlayTrigger,
	Row,
	Tooltip,
	Button,
	ListGroup,
	Form,
	Spinner,
} from 'react-bootstrap';
import {
	checkCourseConstraints,
	ticketsContext,
	SmallRoundButton,
	ticketActionsContext,
	userContext,
	waitingContext,
} from './Miscellaneous';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

/**
 * List of all the courses.
 * Receives the list of all courses from a Context
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
					<Col md={1} className="text-center">
						ID
					</Col>
					<Col className="text-center" md={4}>
						Title
					</Col>
					<Col md={1} className="text-center">
						State
					</Col>
					<Col md={1} className="text-center">
						Owner
					</Col>
					<Col md={1} className="text-center">
						Category
					</Col>
					<Col md={3} className="text-center">
						Date Created
					</Col>
				</Row>
			</Container>
			<Accordion alwaysOpen>
				{tickets.map((ticket) => (
					<Row key={ticket.ticket_id}>
						<Col>
							<Accordion.Item eventKey={ticket.ticket_id}>
								<Accordion.Header>
									<Container>
										<Row>
											<Col md={1}>
												<Badge bg="secondary">
													<tt>#{ticket.ticket_id}</tt>
												</Badge>
											</Col>
											<Col className="text-center" md={4}>
												{<em style={{ color: 'grey' }}>{ticket.title}</em>}{' '}
											</Col>
											<Col md={1} className="text-center">
												<Badge
													bg={ticket.state === 'Closed' ? 'success' : 'warning'}
												>
													{ticket.state}
												</Badge>
											</Col>
											<Col md={1} className="text-center">
												{ticket.owner}
											</Col>
											<Col md={1} className="text-center">
												{ticket.category}
											</Col>
											<Col md={3} className="text-center">
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
				))}
			</Accordion>
		</>
	);
	// ------------------- 1st version -------------------
	// return (
	// 	<Container>
	// 		<Row className="my-4">
	// 			<Table striped hover>
	// 				<thead>
	// 					<tr>
	// 						{headers.map((header, index) => (
	// 							<th key={index}>{header}</th>
	// 						))}
	// 					</tr>
	// 				</thead>
	// 				<tbody>
	// 					{tickets.map((ticket) => (
	// 						<tr key={ticket.ticket_id}>
	// 							<td>{ticket.ticket_id}</td>
	// 							<td>{ticket.submitted_at}</td>
	// 							<td>{ticket.title}</td>
	// 							<td>{ticket.owner}</td>
	// 							<td>{ticket.category}</td>
	// 							<td>
	// 								<Badge bg={ticket.state === 'Closed' ? 'success' : 'warning'}>
	// 									{ticket.state}
	// 								</Badge>
	// 							</td>
	// 							{/* <td>{ticket.estTime}</td> */}
	// 							<td>1 day</td>
	// 						</tr>
	// 					))}
	// 				</tbody>
	// 			</Table>
	// 		</Row>
	// 	</Container>
	// );

	// return (
	// 	<Table striped hover>
	// 		<thead>
	// 			<tr>
	// 				{headers.map((header) => (
	// 					<th key={header}>{header}</th>
	// 				))}
	// 			</tr>
	// 		</thead>
	// 		<tbody>
	// 			<Accordion alwaysOpen>
	// 				<tr>
	// 					{tickets.map((c, i, a) => (
	// 						<TicketItem
	// 							ticket={c}
	// 							toggleAccent={toggleAccent}
	// 							accent={accentList.includes(c.code)}
	// 							key={c.ticket_id}
	// 							first={i === 0}
	// 							last={i === a.length - 1}
	// 						/>
	// 					))}
	// 				</tr>
	// 			</Accordion>
	// 		</tbody>
	// 	</Table>
	// );
}

/**
 * A single course in the CourseList
 *
 * @param props.course the Course object to render
 * @param props.accent display this course as accented
 * @param props.toggleAccent callback to toggle the accent for courses
 * @param props.first boolean, marks this item as first in the collection. Render the rounded top border
 * @param props.last boolean, marks this item as last in the collection. Render the bottom border
 */
function TicketItem(props) {
	const tickets = useContext(ticketsContext);
	const student = useContext(userContext);

	const itemStyle = {
		borderTopRightRadius: '0px',
		borderTopLeftRadius: '0px',
		borderBottomRightRadius: '0px',
		borderBottomLeftRadius: '0px',
		borderBottomWidth: '0px',
	};

	if (props.first) {
		delete itemStyle.borderTopRightRadius;
		delete itemStyle.borderTopLeftRadius;
	} else if (props.last) {
		delete itemStyle.borderBottomWidth;
		delete itemStyle.borderBottomRightRadius;
		delete itemStyle.borderBottomLeftRadius;
	}

	const constraints =
		student?.studyPlan &&
		checkCourseConstraints(
			props.course,
			student.studyPlan,
			tickets,
			student.fullTime
		);
	const constrOk = constraints !== undefined ? constraints.result : true;

	return (
		<Row>
			<Col>
				<Accordion.Item
					eventKey={props.ticket.ticket_id}
					className={
						(props.accent ? 'accent' : '') + (!constrOk ? ' disabled' : '')
					}
					style={itemStyle}
				>
					<Accordion.Header>
						<Container style={{ paddingLeft: '0.5rem' }}>
							<Row>
								<Col md="auto" className="align-self-center">
									<Badge bg="secondary">
										<tt>{props.ticket.ticket_id}</tt>
									</Badge>
								</Col>
								<Col md="auto" style={{ borderLeft: '1px solid grey' }}>
									{constrOk ? (
										props.ticket.title
									) : (
										<em style={{ color: 'grey' }}>{props.ticket.title}</em>
									)}{' '}
									<Badge bg="light" pill style={{ color: 'black' }}>
										{/* CFU: {props.course.cfu} */}
										CFU: CFU
									</Badge>
								</Col>
								<Col
									className="text-end align-self-center"
									style={{ marginRight: '1rem' }}
								>
									<Badge>
										badge
										{/* {props.course.numStudents +
											(props.course.maxStudents
												? '/' + props.course.maxStudents
												: '')}{' '} */}
										<i className="bi bi-person-fill" />
									</Badge>
								</Col>
							</Row>
						</Container>
					</Accordion.Header>
					<Accordion.Body>
						{/* <CourseItemDetails
							course={props.course}
							toggleAccent={props.toggleAccent}
							disabled={!constrOk}
							reason={constraints?.reason}
						/> */}
					</Accordion.Body>
				</Accordion.Item>
			</Col>
			{student?.studyPlan ? (
				<Col
					md="auto"
					className="align-self-center"
					style={{ paddingLeft: '0px' }}
				>
					<ContextualButton constraints={constraints} course={props.course} />
				</Col>
			) : (
				false
			)}
		</Row>
	);
}

/**
 * Details for the CourseItem.
 * This is shown when the corresponding course's row is clicked
 *
 * @param props.course the course the details of which are to be rendered
 * @param props.toggleAccent callback to be passed to CourseCodeHoverable
 * @param props.disabled boolean, used when the course is incompatible with the current study plan
 * @param props.reason reason why this course is disabled (as returned by "checkCourseConstraints")
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

	const handleCloseTicket = () => {
		if (window.confirm('Are you sure you want to close this ticket?')) {
			setWaiting(true);
			ticketActions.editTicketState(props.ticket.ticket_id, 'Closed', () =>
				setWaiting(false)
			);
		}
	};

	return (
		<Container>
			<div className="d-flex justify-content-between align-items-center">
				<p className="mb-0">{props.ticket.initial_text}</p>
				{props.ticket.state === 'Open' &&
					user &&
					user.id === props.ticket.owner_id && (
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
					)}
			</div>
			<ListGroup className="mx-3 mt-3">
				{props.ticket.text_blocks.map((text_block) => (
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
								<div className="mt-2">{text_block.text}</div>
							</Col>
						</Row>
					</ListGroup.Item>
				))}
			</ListGroup>
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
 * Displays the course code of a provided course that shows the full name when hovered
 *
 * @param props.course the course of which to show the code
 * @param props.color color of the displayed code
 * @param props.toggleAccent callback to toggle the accent for the corresponding row of the course list
 */
function CourseCodeHoverable(props) {
	return (
		<OverlayTrigger
			placement="top"
			overlay={
				<Tooltip id={'tooltip-' + props.course.code}>
					{props.course.name}
				</Tooltip>
			}
			onToggle={props.toggleAccent}
		>
			<strong style={props.color ? { color: props.color } : {}}>
				<tt>{props.course.code}</tt>
			</strong>
		</OverlayTrigger>
	);
}

export { TicketList };
