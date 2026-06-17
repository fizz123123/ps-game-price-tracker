## 1. Backend Foundation

- [x] 1.1 Establish an Express base server that can serve API routes and static frontend files.
- [x] 1.2 Add `GET /api/health` to return a simple successful health response.

## 2. SQLite Setup

- [x] 2.1 Create `database.js` for opening and sharing the SQLite database connection.
- [x] 2.2 Create the `game_prices` table with `id`, `release_date`, `record_date`, `game_name`, `platform`, `edition`, `price`, `source`, `data_type`, `note`, and `created_at`.

## 3. Core Price APIs

- [x] 3.1 Implement `GET /api/prices` to return all price records.
- [x] 3.2 Implement `GET /api/prices?keyword=` to filter records by partial `game_name` match.
- [x] 3.3 Make the keyword search case-insensitive.
- [x] 3.4 Implement `POST /api/prices` to create a manual price record.
- [x] 3.5 In `POST /api/prices`, set `data_type` to `manual` by default for manually created records.
- [x] 3.6 Implement backend validation for required fields: `record_date`, `game_name`, `platform`, and `price`.
- [x] 3.7 Implement backend validation that `price` is numeric and greater than 0.
- [x] 3.8 Implement `DELETE /api/prices/:id` to delete an existing record by id.
- [x] 3.9 Return `204 No Content` after successfully deleting an existing record.
- [x] 3.10 Return `404 Not Found` when deleting a missing record id.

## 4. Frontend Interface

- [x] 4.1 Create the frontend HTML form for entering `release_date`, `record_date`, `game_name`, `platform`, `edition`, `price`, `source`, and `note`.
- [x] 4.2 Do not include `data_type` as a user input field in the manual create form.
- [x] 4.3 Create the frontend table for displaying all price records.
- [x] 4.4 Display `data_type` in the table so users can see whether a record is `manual` or `crawler`.
- [x] 4.5 Add a delete control for each displayed record.

## 5. Fetch Integration

- [x] 5.1 Use `fetch` to load records from `GET /api/prices` when the page opens.
- [x] 5.2 Use `fetch` to submit new records to `POST /api/prices`.
- [x] 5.3 Refresh the table after a record is successfully created.
- [x] 5.4 Use `fetch` to delete records through `DELETE /api/prices/:id`.
- [x] 5.5 Refresh the table after a record is successfully deleted.

## 6. Search

- [x] 6.1 Add a game name keyword search input to the frontend.
- [x] 6.2 Use `fetch` to call `GET /api/prices?keyword=` with the entered keyword.
- [x] 6.3 Display matching records in the table.
- [x] 6.4 Return all records when the keyword is empty.

## 7. Error Handling and Validation

- [x] 7.1 Add frontend validation for missing required fields before submitting the form.
- [x] 7.2 Required frontend fields are `record_date`, `game_name`, `platform`, and `price`.
- [x] 7.3 Add frontend validation that `price` is numeric and greater than 0.
- [x] 7.4 Display user-facing error messages when create, search, load, or delete requests fail.
- [x] 7.5 Verify that SQLite data remains visible after refreshing the page.
- [x] 7.6 Verify that SQLite data remains visible after stopping and restarting the server.

## 8. Optional Crawler

- [x] 8.1 After the core MVP works, optionally add `POST /api/crawl/ps-store`.
- [x] 8.2 Ensure the optional crawler only reads a small amount of public PlayStation Store Taiwan new-release data.
- [x] 8.3 Limit the optional crawler demo to about 3 to 5 records.
- [x] 8.4 Ensure the optional crawler does not use PlayStation internal APIs.
- [x] 8.5 Ensure the optional crawler avoids large-volume or repeated requests.
- [x] 8.6 Set `data_type` to `crawler` for records created by the optional crawler.

## 9. Quality Fixes

- [x] 9.1 Trim optional text fields before inserting records.
- [x] 9.2 Reject non-integer prices such as `1990.5`.
- [x] 9.3 Validate `record_date` and optional `release_date` as `YYYY-MM-DD`.
- [x] 9.4 Keep manual record `data_type` controlled by the backend as `manual`.
- [x] 9.5 Clarify OpenSpec wording that `data_type` is not user-entered.
