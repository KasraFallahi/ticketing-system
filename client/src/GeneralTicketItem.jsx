import { Card, Col, Container, Row, Badge } from 'react-bootstrap';

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

export default GeneralTicketItem;
