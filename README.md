# T3 - Time Tracking Trial

This project is a time-tracking application built as a "plug-n-play" replacement for [Insightful](https://www.insightful.io), based on their public API contract. It includes a backend API, a web interface for employee onboarding, and is designed to work with a local time-tracking desktop application.

This application was built using the Next.js framework.

## Features

*   **Insightful API Compatible:** Core API endpoints for Employees, Projects, Tasks, Time Tracking, and Screenshots are implemented to match the Insightful API contract.
*   **Web Application:** A minimal web app for new employees to activate their accounts and download the desktop client.
*   **API Documentation:** A comprehensive Swagger UI documentation for all available API endpoints.

## Live API Documentation

All API endpoints are documented and can be tested live via Swagger UI:

[https://mercor-assignment-olive.vercel.app/api-docs](https://mercor-assignment-olive.vercel.app/api-docs)

## Getting Started: Ideal Flow

As there is no admin dashboard, the application flow should be tested and used via the API documentation.

1.  **Admin Login:**
    *   Navigate to the [API Documentation](https://mercor-assignment-olive.vercel.app/api-docs).
    *   Find the `/api/auth/login` endpoint for employees and log in with the admin credentials:
        *   **Username:** `admin@mercor.com`
        *   **Password:** `Admin@123`
    *   This will generate a JWT token.

2.  **Authorize Swagger UI:**
    *   Click the "Authorize" button at the top of the Swagger UI page.
    *   Enter the token you received in the previous step in the format `Bearer <your_token>`.

3.  **Add Employees:**
    *   Use the authorized `POST /api/v1/employee` endpoint to add new employees.
    *   The new employee will receive an activation email. (Note: Due to free-tier limitations, this may only work for specific email addresses).

4.  **Employee Activation:**
    *   The employee clicks the link in the activation email.
    *   They will be redirected to a web page to set their password and activate their account.

5.  **Download Desktop App:**
    *   After activation, the employee is redirected to a page where they can download the desktop time-tracking application.

6.  **Manage Projects and Tasks:**
    *   The admin can use the `Project` and `Task` API endpoints to assign work to employees, which will be reflected in their desktop application.

## Technical Details

This is a Next.js application utilizing Prisma as the ORM for database management. The API is built to be a direct replacement for the Insightful service, intended for integration with Mercor's existing systems.

## Limitations

*   **No Admin Dashboard:** All administrative actions (like adding employees, projects, etc.) must be performed through the API.
*   **Email Service:** The email activation feature is subject to free-tier limitations of the email service provider.
