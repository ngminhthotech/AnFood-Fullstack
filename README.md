<div align="center">

# 🍔 AnFood — Full-Stack Food Ordering Platform

**A food ordering web application built with ASP.NET Core 8, React 19, and MySQL.**

A portfolio project exploring end-to-end e-commerce workflows, REST API design, database-backed application development, and AI-assisted experiences.

[Explore the Source Code](https://github.com/ngminhthotech/AnFood-Fullstack) · [Backend](./AnFoodAPI) · [Frontend](./AnFoodWeb) · [Architecture Diagrams](./diagrams)

</div>

---

## Overview

**AnFood** brings together a customer-facing food ordering interface and an ASP.NET Core backend. The project covers essential online ordering workflows and integrates supporting modules for administration, payment processing, and conversational assistance.

This repository is maintained as a **software development and portfolio project**. Some integrations require your own credentials and service configuration to run locally.

## Highlights

- **Food discovery:** browse food items and access product details.
- **Customer accounts:** registration, login, and profile-related flows.
- **Ordering experience:** shopping and checkout-related workflows.
- **Order management:** application flows for viewing and managing orders.
- **Administration:** dedicated admin-facing pages and supporting API endpoints.
- **Payment integration:** service code for VNPay and MoMo sandbox payment workflows.
- **AI-assisted experiences:** chatbot and voice-assistant components, with integration points for external AI and speech services.
- **Recommendation exploration:** machine-learning and recommendation-related components in the backend.

> **Project scope:** The features above reflect modules present in the codebase. Availability and completeness depend on local configuration and the associated services. They are not a claim of production readiness.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, JavaScript, Vite 7, React Router |
| UI & visualization | Tailwind CSS, Lucide React, Framer Motion, Recharts |
| API | C#, ASP.NET Core 8, REST-style endpoints |
| Data access | Entity Framework Core 8, Pomelo MySQL provider |
| Database | MySQL |
| Authentication | JWT Bearer authentication |
| API documentation | Swagger / OpenAPI |
| AI & recommendations | Google Gemini integration, ML.NET packages |
| Payments | VNPay and MoMo integration code |

## Architecture

```text
                        ┌──────────────────────────┐
                        │       React / Vite       │
                        │  Customer & Admin UI     │
                        └────────────┬─────────────┘
                                     │ HTTP / JSON
                                     ▼
                        ┌──────────────────────────┐
                        │     ASP.NET Core API     │
                        │ Controllers & Services   │
                        └───────┬─────────┬────────┘
                                │         │
                                ▼         ▼
                          ┌─────────┐  ┌────────────────────┐
                          │  MySQL  │  │ External Services  │
                          │  EF Core│  │ Payments / AI      │
                          └─────────┘  └────────────────────┘
```

See the [`diagrams/`](./diagrams) directory for available sequence and design diagrams.

## Repository Structure

```text
AnFood-Fullstack/
├── AnFoodAPI/                 # ASP.NET Core API, services, models, migrations
│   └── appsettings.example.json
├── AnFoodWeb/                 # React + Vite application
├── diagrams/                  # UML and architecture documentation
├── .env.example               # Sample environment variables
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **.NET SDK 8**
- **Node.js** compatible with Vite 7 (Node.js 20.19+ or 22.12+)
- **MySQL** server
- **Git**
- Optional: credentials for supported payment, AI, or voice integrations

### 1. Clone the repository

```bash
git clone https://github.com/ngminhthotech/AnFood-Fullstack.git
cd AnFood-Fullstack
```

### 2. Configure the backend

Create a local configuration file from the provided example:

**PowerShell (Windows):**

```powershell
Copy-Item AnFoodAPI/appsettings.example.json AnFoodAPI/appsettings.json
```

Edit `AnFoodAPI/appsettings.json` and set your **local MySQL connection string** and any required integration settings. Use your own development credentials; do not use credentials from another environment.

Install dependencies and run the API:

```powershell
cd AnFoodAPI
dotnet restore
dotnet run
```

The API address is printed in the terminal when the server starts. Swagger/OpenAPI availability depends on the project's environment configuration.

> Database initialization: Make sure the local MySQL database and schema match the EF Core models and migrations included in the project. Review the migration configuration before applying migrations to an existing database.

### 3. Configure and run the frontend

From the repository root, open a second terminal:

```powershell
cd AnFoodWeb
npm install
```

Create `AnFoodWeb/.env.local` with the API URL matching the backend address:

```dotenv
VITE_API_ROOT=http://localhost:5010
VITE_API_URL=http://localhost:5010/api
```

Adjust the port if your API runs elsewhere. Then start Vite:

```powershell
npm run dev
```

Open the local address displayed by Vite (often `http://localhost:5173`).

### Useful commands

| Purpose | Command | Working directory |
| --- | --- | --- |
| Start backend | `dotnet run` | `AnFoodAPI` |
| Start frontend | `npm run dev` | `AnFoodWeb` |
| Build frontend | `npm run build` | `AnFoodWeb` |
| Lint frontend | `npm run lint` | `AnFoodWeb` |
| Preview frontend build | `npm run preview` | `AnFoodWeb` |

## Configuration & Security

- Commit **example configuration files only**; keep `.env`, `.env.local`, `appsettings.json`, and `appsettings.Development.json` out of version control.
- Store API keys, payment secrets, database credentials, and JWT signing secrets outside the repository.
- Rotate any credentials that have previously appeared in commits, screenshots, logs, or public artifacts.
- Review security-sensitive integrations before deploying or making a development environment publicly accessible.
- Treat payment integrations as **sandbox/development integrations** unless independently configured and validated for production.

## Project Documentation

Detailed UML diagrams and related design notes are available under [`diagrams/`](./diagrams). These document ordering, payment, recommendation, and chatbot-related processes.

## Screenshots

Screenshots will be added after reviewing and preparing a set of representative, non-sensitive UI images. This section is intentionally left without fabricated previews.

## Future Improvements

- Expand automated tests and continuous integration.
- Improve installation and database-seeding documentation.
- Refine responsive design and accessibility.
- Add integration tests for ordering and payment callbacks.
- Improve observability, error handling, and deployment documentation.

## Author

**Nguyễn Minh Thơ**  
GitHub: [@ngminhthotech](https://github.com/ngminhthotech)

---

<div align="center">

*Built to practice full-stack software engineering and explore intelligent e-commerce experiences.*

</div>
