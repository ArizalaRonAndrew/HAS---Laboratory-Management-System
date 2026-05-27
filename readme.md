# Laboratory Management System — Testing Documentation

This microservice handles laboratory test requests, tracks status changes, logs test findings, and integrates securely with the **HAS Adapter Layer** and **Notification System**.

---

## 🚀 Setup & Installation

### 1. Configure the Environment

Ensure your `.env` file matches the shared JWT secret key of the central Authentication System (`ron`) and points to the live production URLs of the external services.

```env
PORT=5000
SUPABASE_URL=secretdb
SUPABASE_ANON_KEY=secret
SECRET=wkzg15151515@
ADAPTER_URL=https://has-adapter-layer.onrender.com/api/adapter
NOTIFICATION_URL=https://notification-lrqp.onrender.com

```

### 2. Run the Server

Install dependencies and boot up your local instance:

```bash
npm install
npm run dev

```

The server will start running on **`http://localhost:5000`**.

---

## 🔐 Authentication Preparation

Every endpoint in this service is guarded by a local `authHandler` middleware wrapper. Before calling any route, make sure to acquire a valid Bearer Token.

1. **Get a Token:** Send a `POST` request to `https://has-auth.onrender.com/api/auth/login` with valid credentials.
2. **Setup Postman Collection Authorization:**

- In Postman, select your request **Collection** settings.
- Go to the **Authorization** tab.
- Select **Type:** `Bearer Token`.
- Paste your full extracted JWT token directly into the **Token** field and click **Save**.
- Ensure each separate request tab inside this collection sets its **Authorization** type to **"Inherit auth from parent"**.

---

## 🧪 Postman Endpoint Testing Guide

### 1. Create Lab Test Request

Validates the patient appointment state through the Adapter Layer, flags the Notification service, and records a new entry into your database with a `'Pending'` status.

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/lab/requests`
- **Body Format:** `raw` -> `JSON`
- **Request Payload Example:**

```json
{
  "appointmentId": "69b6a42cf1ab5c7aa5bf10cb",
  "patientId": "699faf2d57354ad8d0ad70cb",
  "testType": "Complete Blood Count (CBC)"
}
```

> ⚠️ **Data Integrity Note:** The `appointmentId` and `patientId` must be valid values linked directly together in the Legacy Hospital System via the adapter layer.

- **Expected Response (`201 Created`):**

```json
{
  "success": true,
  "requestID": 1
}
```

---

### 2. Fetch All Lab Requests

Retrieves every record present inside the database. Used by clinic admins or laboratory staff.

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/lab/requests`
- **Body Format:** `None`
- **Expected Response (`200 OK`):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "appointmentID": "69b6a42cf1ab5c7aa5bf10cb",
      "patientID": "699faf2d57354ad8d0ad70cb",
      "testType": "Complete Blood Count (CBC)",
      "status": "Pending",
      "createdAt": "2026-05-19T13:15:00.000Z"
    }
  ]
}
```

---

### 3. Fetch Lab Requests by Patient ID

Isolates the master request tracker list down to records matching a distinct patient profile.

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/lab/requests/patient/699faf2d57354ad8d0ad70cb`
- **Body Format:** `None`
- **Expected Response (`200 OK`):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "appointmentID": "69b6a42cf1ab5c7aa5bf10cb",
      "patientID": "699faf2d57354ad8d0ad70cb",
      "testType": "Complete Blood Count (CBC)",
      "status": "Pending",
      "createdAt": "2026-05-19T13:15:00.000Z"
    }
  ]
}
```

---

### 4. Create Lab Result for a Request

Submits the final test findings, links them to the request using a foreign key constraint, updates the original lab request status to `'Completed'`, and alerts the patient.

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/lab/results`
- **Body Format:** `raw` -> `JSON`
- **Request Payload Example:**

```json
{
  "requestId": 1,
  "patientId": "699faf2d57354ad8d0ad70cb",
  "resultData": "Hemoglobin: 14.2 g/dL (Normal), White Blood Cell Count: 7,200 cells/mcL (Normal)."
}
```

> ⚠️ **Database Constraint Note:** If you encounter a foreign key constraint error, make sure the `requestId` provided is an exact match to an existing `id` inside your `lab_requests` table.

- **Expected Response (`201 Created`):**

```json
{
  "success": true,
  "resultID": 1
}
```

---

### 5. Update Lab Request Status Manually

Changes the processing state of a specific test manually (e.g., transitioning from `Pending` to `Sample Collected`, `In Progress`, or `Cancelled`).

- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/lab/requests/1/status`
- **Body Format:** `raw` -> `JSON`
- **Request Payload Example:**

```json
{
  "status": "In Progress"
}
```

- **Expected Response (`200 OK`):**

```json
{
  "success": true
}
```

---

### 6. Fetch Lab Results by Patient ID

Retrieves all completed lab results for a patient, executing a relational join query underneath to combine the matching test specifications and results.

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/lab/results/patient/699faf2d57354ad8d0ad70cb`
- **Body Format:** `None`
- **Expected Response (`200 OK`):**

```json
{
  "success": true,
  "data": [
    {
      "resultID": 1,
      "requestID": 1,
      "testType": "Complete Blood Count (CBC)",
      "resultData": "Hemoglobin: 14.2 g/dL (Normal), White Blood Cell Count: 7,200 cells/mcL (Normal).",
      "createdAt": "2026-05-19T13:30:00.000Z"
    }
  ]
}
```

---

## 🛠️ Diagnostics & Troubleshooting

### Security Verification Rule Check

To explicitly test the constraint: _"The system must not process a request from an unauthorized user"_:

1. Select any of the saved endpoint request configurations above in Postman.
2. Go directly to its specific **Authorization** route tab.
3. Override its properties by updating the **Type** dropdown to **No Auth**.
4. Press **Send**.

The application must block execution and yield a `401 Unauthorized` response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```
