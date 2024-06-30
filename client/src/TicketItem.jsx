import { useContext } from 'react';
import { Accordion, Badge, Col, Container, Row } from 'react-bootstrap';
import { userContext } from './Miscellaneous';
import TicketItemDetails from './TicketItemDetails';

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
										<>{ticket.estClosure} hours</>
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

export default TicketItem;
