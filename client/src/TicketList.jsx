import { useContext } from 'react';
import { Accordion, Col, Container, Row, Button } from 'react-bootstrap';
import { ticketsContext, userContext } from './Miscellaneous';
import { useNavigate } from 'react-router-dom';
import TicketItem from './TicketItem';
import GeneralTicketItem from './GeneralTicketItem';

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

export default TicketList;
