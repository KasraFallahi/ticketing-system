import { Container, Row, Col, Button, Card, ListGroup } from 'react-bootstrap';

/**
 * The confirmation page for ticket submission
 *
 * @param props.ticketData the data of the ticket to confirm
 * @param props.onDiscard callback to discard the submission and go back
 * @param props.onConfirm callback to confirm the submission
 */
function TicketConfirmation(props) {
	const { title, category, description } = props.ticketData;

	return (
		<Container style={{ marginTop: '6rem' }}>
			<Row className="justify-content-md-center">
				<Col md={6}>
					<h3 className="text-start mb-4">Confirm Ticket Submission</h3>
					<Card>
						<Card.Body>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<strong>Title:</strong> {title}
								</ListGroup.Item>
								<ListGroup.Item>
									<strong>Category:</strong> {category}
								</ListGroup.Item>
								<ListGroup.Item>
									<strong>Description:</strong> {description}
								</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
					<div className="mt-4 d-flex justify-content-between">
						<Button variant="secondary" onClick={props.onDiscard}>
							Discard
						</Button>
						<Button variant="primary" onClick={props.onConfirm}>
							Confirm
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default TicketConfirmation;
