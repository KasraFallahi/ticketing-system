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
  "author" VARCHAR(255) NOT NULL,
  "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

INSERT INTO users ("email", "name", "hash", "salt")
VALUES
  ('user1@example.com', 'John Doe', 'hashed_password1', 'random_salt1'),
  ('user2@example.com', 'Jane Smith', 'hashed_password2', 'random_salt2'),
  ('user3@example.com', 'Alice Johnson', 'hashed_password3', 'random_salt3');

INSERT INTO tickets ("owner", "category", "owner", "title", "initial_text")
VALUES
  (1, 'Technical Issue', 'user1@example.com', 'My computer is slow!', 'My computer has been running very slow lately. I can barely open any programs.'),
  (2, 'Question', 'user2@example.com', 'How do I request a vacation day?', 'I am unsure of the process for requesting a vacation day. Can you please provide instructions?'),
  (1, 'Feature Request', 'user3@example.com', 'Add a dark mode option', 'I would love to see a dark mode option added to the application.');

INSERT INTO text_blocks ("ticket_id", "text", "author")
VALUES
  (1, 'We are investigating the performance issue you reported. We will get back to you soon.', 'support@example.com'),
  (2, 'You can submit a vacation request by logging into the employee portal and navigating to the time-off section.', 'human_resources@example.com'),
  (3, 'Thank you for your feature request! We will consider it for future development.', 'product_team@example.com');

COMMIT;