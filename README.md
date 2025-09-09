# ProTime
A lightweight React + MUI web app for team time tracking, project management, leave requests, approvals, and payroll reporting. It talks to a REST API at `http://localhost:3000` and supports role-based access (Employee, Supervisor). Mostly to manage freelancer collaboration.

## Key Features
- **Auth**: Email/password login & signup. Choose *Employee* or *Supervisor* (Ensure to use PIN: `1111` during registration).
- **Member Dashboard**: Weekly hours progress, pending/approved leave snapshot.
- **Supervisor Dashboard**: Team KPIs including pending approvals.
- **Projects**: Create/edit projects, set budgeted hours, assign members.
- **Employee Kanban**: Not Started → In Progress → Done → Completed, with start/pause timers and local progress tracking. When Supervisor addsa any project it goes to Not Started for that employee, and when they submit it goes to done and gets locke, then only supervisor can check on their panel, approve or reject. Reject > In porgress, Approve > Completed.
- **Timesheets**: Weekly view of logged entries and daily totals.
- **Leave**: Employees request time off; supervisors approve/reject.
- **Approvals**: Review project/task submissions and leave requests in one place.
- **Reports / Payroll**: Date-range and per-project/employee rollups, default wage **৳600/hr** (configurable), CSV export.

## Tech Stack
This application is built as a Single-Page Application (SPA) that communicates with a backend API for all data operations.
Frontend Framework: React.js is used to build the dynamic and component-based user interface. The app is built entirely with functional components leveraging React Hooks (useState, useEffect, useContext) for state and lifecycle management.
UI Library: Material-UI (MUI) provides a comprehensive suite of pre-built, customizable components for a polished and consistent user experience.
Architecture: The frontend's component-based structure is designed to work seamlessly with a backend built on an MVC (Model-View-Controller) architecture. This separation of concerns ensures that the application is scalable and easy to maintain.
View: Handled by the React components.
Controller/Model: Managed by the backend API, which the React app communicates with via RESTful endpoints (GET, POST, PUT, DELETE).

## Getting Started
1. **Prereqs**: Node 18+, and a backend running at `http://localhost:3000` exposing the app’s `/api/*` endpoints.
2. **Install**:
   ```bash
   npm install
   npm start
