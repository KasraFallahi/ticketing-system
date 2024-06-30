import { useState } from 'react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import TicketConfirmation from './TicketConfirmation'; // Import the TicketConfirmation component

/**
 * The submit ticket page displayed on "/create-ticket"
 *
 * @param props.createTicketCbk callback to perform creating a ticket
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 * @param props.ticketCreationActions object containing actions for ticket creation, including fetchEstimatedTime
 */
function CreateTicketForm(props) {
	const [formData, setFormData] = useState({
		title: '',
		category: '',
		description: '',
	});

	const [formValid, setFormValid] = useState({
		title: true,
		category: true,
		description: true,
	});
	const [waiting, setWaiting] = useState(false);
	const [isConfirming, setIsConfirming] = useState(false); // State to manage form confirmation step
	const [estimatedTime, setEstimatedTime] = useState(null); // State to store estimated time
	const navigate = useNavigate(); // Hook to navigate back

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		setFormValid({ ...formValid, [name]: true }); // Reset validation state on change
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Validate form
		const titleValid = !validator.isEmpty(formData.title);
		const categoryValid = !validator.isEmpty(formData.category);
		const descriptionValid = !validator.isEmpty(formData.description);

		if (titleValid && categoryValid && descriptionValid) {
			try {
				// TODO fix fetching estimated time issue(related to JWT)
				const estimateResponse =
					await props.ticketCreationActions.fetchEstimatedTime(
						formData.title,
						formData.category
					);
				setEstimatedTime(estimateResponse); // Store estimated time
				setIsConfirming(true); // Switch to confirmation step
			} catch (err) {
				console.error('Failed to fetch estimated time:', err);
				setFormValid({
					title: titleValid,
					category: categoryValid,
					description: descriptionValid,
				});
			}
		} else {
			setFormValid({
				title: titleValid,
				category: categoryValid,
				description: descriptionValid,
			});
		}
	};

	const handleDiscard = () => {
		setIsConfirming(false); // Go back to form
	};

	const handleConfirm = () => {
		setWaiting(true);
		props.createTicketCbk(formData, () => setWaiting(false));
	};

	if (isConfirming) {
		return (
			<TicketConfirmation
				ticketData={formData}
				estimatedTime={estimatedTime}
				onDiscard={handleDiscard}
				onConfirm={handleConfirm}
			/>
		);
	}

	return (
		<Container style={{ marginTop: props.errorAlertActive ? '2rem' : '6rem' }}>
			<Row className="justify-content-md-center">
				<Col md={6}>
					<h3 className="text-start mb-4">Submit a Ticket</h3>
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="formTitle" className="mb-3">
							<Form.Label>Title</Form.Label>
							<Form.Control
								isInvalid={!formValid.title}
								type="text"
								placeholder="Enter the title"
								name="title"
								value={formData.title}
								onChange={handleChange}
							/>
							<Form.Control.Feedback type="invalid">
								Title must not be empty
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group controlId="formCategory" className="mb-3">
							<Form.Label>Category</Form.Label>
							<Form.Select
								isInvalid={!formValid.category}
								aria-label="Default select example"
								name="category"
								value={formData.category}
								onChange={handleChange}
							>
								<option value="">Select issue type...</option>
								<option value="inquiry">Inquiry</option>
								<option value="maintenance">Maintenance</option>
								<option value="new feature">New Feature</option>
								<option value="administrative">Administrative</option>
								<option value="payment">Payment</option>
							</Form.Select>
							<Form.Control.Feedback type="invalid">
								Category must not be empty
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group controlId="formDescription" className="mb-4">
							<Form.Label>Description</Form.Label>
							<Form.Control
								isInvalid={!formValid.description}
								as="textarea"
								rows={3}
								name="description"
								value={formData.description}
								onChange={handleChange}
							/>
							<Form.Control.Feedback type="invalid">
								Description must not be empty
							</Form.Control.Feedback>
						</Form.Group>

						<div className="d-flex justify-content-between">
							<Button
								variant="secondary"
								onClick={() => navigate('/')}
								disabled={waiting}
							>
								Back
							</Button>
							<Button variant="primary" type="submit" disabled={waiting}>
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
									'Submit'
								)}
							</Button>
						</div>
					</Form>
				</Col>
			</Row>
		</Container>
	);
}

export { CreateTicketForm };
