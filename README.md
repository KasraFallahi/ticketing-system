# Exam #1: "Ticketing System"

## Student: s322877 FALLAHI SEYED KASRA

## React Client Application Routes

- Route `/`: Home page, shows the list of all tickets. Logged in users can also see and edit the tickets(based on their privilage).
- Route `/login`: Login form, allows users to login. After a successful login, the user is redirected to the main route ("/").
- Route `/create-ticket`: Ticket creation form, allows logged in and admin users to create a new ticket. After successful submission, the user is redirected to the main route ("/").
- Route `*`: Page for nonexisting URLs (_Not Found_ page) that redirects to the home page.

## API Server

- **GET `/api/tickets`**: Get all the tickets as a JSON list.

  - **Response body**: JSON object with the list of tickets, or description of the error(s):
    ```
    [
      {
        "ticket_id": 1,
        "state": "Open",
        "category": "inquiry",
        "title": "Example Ticket",
        "initial_text": "This is an example ticket.",
        "submitted_at": "2024-06-29T12:34:56.000Z",
        "owner": "John Doe",
        "owner_id": 1,
        "text_blocks": [
          {
            "text_block_id": 1,
            "text": "This is an example text block.",
            "author": "John Doe",
            "submitted_at": "2024-06-29T13:34:56.000Z"
          }
        ]
      },
      ...
    ]
    ```
  - Codes: `200 OK`, `500 Internal Server Error`.

- **POST `/api/create-ticket`**: Create a new ticket for the currently logged in user.

  - **Request body**: JSON object with the ticket details:
    ```
    {
      "category": "inquiry",
      "title": "New Ticket",
      "description": "Description of the new ticket."
    }
    ```
  - **Response body**: Empty on success, or a JSON object with error description.
  - Codes: `200 OK`, `400 Bad Request` (invalid request body), `401 Unauthorized`, `500 Internal Server Error`.

- **PATCH `/api/ticket/:id`**: Edit the state or category of an existing ticket for the currently logged-in user.

  - **Request body**: JSON object with the new state or category. Only one of the fields (either `state` or `category`) is required:
    ```
    {
      "state": "Closed"
    }
    ```
    or
    ```
    {
      "category": "maintenance"
    }
    ```
  - **Response body**: Empty on success, or a JSON object with error description.
  - Codes: `200 OK`, `400 Bad Request` (invalid request body), `401 Unauthorized`, `500 Internal Server Error`.

- **POST `/api/ticket/:id/text-block`**: Add a text block to an existing ticket for the currently logged-in user.

  - **Request body**: JSON object with the text block content:
    ```
    {
      "text": "This is a new text block."
    }
    ```
  - **Response body**: Empty on success, or a JSON object with error description.
  - Codes: `200 OK`, `400 Bad Request` (invalid request body), `401 Unauthorized`, `500 Internal Server Error`.

  ### Authentication APIs

* **POST `/api/session`**: Authenticate and login the user.

  - **Request body**: JSON object with username and password:
    ```
    {
      "username": "user@example.com",
      "password": "password"
    }
    ```
  - **Response body**: JSON object with the user's info on success, or a JSON object with error description:
    ```
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
    ```
  - Codes: `200 OK`, `400 Bad Request` (invalid request body), `401 Unauthorized`, `500 Internal Server Error`.

* **DELETE `/api/session`**: Logout the user.

  - **Response body**: Empty on success, or a JSON object with error description.
  - Codes: `200 OK`, `401 Unauthorized`.

* **GET `/api/auth-token`**: Get an auth token for the logged in user.
  - **Response body**: JSON object with the token.
    ```
    {
      "token": "jwt-token-here"
    }
    ```
  - **Token payload**:
    ```
    {
      "userId": 1
    }
    ```
  - Codes: `200 OK`, `401 Unauthorized`.

## API Server2

- **POST `/api/estimate-time`**: Returns the estimated time to close a ticket based on its title and category.
  - **Request Headers**: JWT token
  - **Request**: JSON object with the ticket title and category
    ```
    {
      "title": "Issue with login",
      "category": "Technical Issue"
    }
    ```
  - **Response body**: JSON object with the estimated time in hours for admin users or days for regular users
    - For admin users:
      ```
      {
        "estimatedHours": 50
      }
      ```
    - For regular users:
      ```
      {
        "estimatedDays": 3
      }
      ```
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request` (invalid request body).

## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.png)

## Users Credentials

- username, password (plus any other requested info which depends on the text)
- username, password (plus any other requested info which depends on the text)
