BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
  "user_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "is_admin" INTEGER DEFAULT 0,
  "email"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "tickets" (
  "ticket_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "owner" INTEGER NOT NULL,
  "state" VARCHAR(255) NOT NULL DEFAULT 'Open',
  "category" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "initial_text" TEXT NOT NULL,
  "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS "text_blocks" (
  "text_block_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "ticket_id" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "author" INTEGER NOT NULL,
  "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (author) REFERENCES users(user_id)
);

INSERT INTO users ("email", "is_admin", "name", "hash", "salt")
VALUES
  ('u1@p.it', 0, 'User1', '0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597', '96a0f4e845fc918f5400b4e92ed0d345'),
  ('u2@p.it', 0, 'User2', '0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597', '96a0f4e845fc918f5400b4e92ed0d345'),
  ('u3@p.it', 0, 'User3', '0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597', '96a0f4e845fc918f5400b4e92ed0d345'),
  ('a1@p.it', 1, 'Admin1', '0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597', '96a0f4e845fc918f5400b4e92ed0d345'),
  ('a2@p.it', 1, 'Admin2', '0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597', '96a0f4e845fc918f5400b4e92ed0d345');

INSERT INTO tickets ("owner", "category", "title", "initial_text")
VALUES
  (1, 'Technical Issue', 'My computer is slow!', 'My computer has been running very slow lately. I can barely open any programs.'),
  (2, 'Question', 'How do I request a vacation day?', 'I am unsure of the process for requesting a vacation day. Can you please provide instructions?'),
  (1, 'Feature Request', 'Add a dark mode option', 'I would love to see a dark mode option added to the application.');

INSERT INTO text_blocks ("ticket_id", "text", "author")
VALUES
  (32, 'We are investigating the performance issue you reported. We will get back to you soon.', 1),
  (33, 'You can submit a vacation request by logging into the employee portal and navigating to the time-off section.', 2),
  (34, 'Thank you for your feature request! We will consider it for future development.', 1),
  (35, 'The air conditioner technician will visit your office tomorrow.', 3),
  (36, 'Please provide your new address and phone number.', 4),
  (37, 'We have corrected the invoice error and updated your account.', 5),
  (38, 'The project deadline is set for the end of this month.', 1),
  (39, 'The printer ink has been refilled. You can use it now.', 2),
  (40, 'We have added calendar integration to our development roadmap.', 3),
  (41, 'Your new ID card request has been processed.', 4),
  (32, 'The performance issue seems to be related to low memory. Please try closing some applications.', 5),
  (33, 'Vacation requests should be submitted at least two weeks in advance.', 1),
  (34, 'Our development team is reviewing your feature request.', 2),
  (35, 'The air conditioner issue is more severe than anticipated. We will need additional time to fix it.', 3),
  (36, 'Your personal details have been updated in our system.', 4),
  (37, 'Please check your email for the corrected invoice.', 5),
  (38, 'We have extended the project deadline by one week.', 1),
  (39, 'Please let us know if you encounter any further issues with the printer.', 2),
  (40, 'The calendar integration feature is expected to be available by next quarter.', 3),
  (41, 'Your replacement ID card is ready for pickup.', 4),
  (32, 'We have resolved the performance issue. Please check and confirm.', 5),
  (33, 'You can track your vacation request status in the employee portal.', 1),
  (34, 'Your feature request has been prioritized in our backlog.', 2),
  (35, 'The air conditioner has been fixed and is working properly now.', 3),
  (36, 'Please confirm if your updated personal details are correct.', 4),
  (37, 'We apologize for the inconvenience caused by the invoice error.', 5),
  (38, 'Please submit your project updates by the new deadline.', 1),
  (39, 'The printer is now fully operational.', 2),
  (40, 'We will notify you once the calendar integration is complete.', 3),
  (41, 'Please bring a valid ID for picking up your new card.', 4);

COMMIT;