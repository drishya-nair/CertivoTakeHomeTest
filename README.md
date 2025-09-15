# Certivo Compliance Dashboard

A full-stack application that processes Bill of Materials (BOM) and compliance data to provide an interactive dashboard for monitoring product compliance status. The system combines data from different sources, calculates compliance metrics, and presents them through a modern web interface with authentication and real-time filtering capabilities.

## Project Overview

This application was built as a take-home assignment to demonstrate full-stack development skills. It features a Node.js/TypeScript backend API that processes BOM and compliance data, and a Next.js frontend that provides an intuitive dashboard for viewing compliance insights. The system includes JWT-based authentication, data validation, error handling, and comprehensive testing.

## File Structure

The project is organized as a monorepo with the following structure:

```
CertivoTakeHomeTest/
├── apps/
│   ├── api/                    # Backend API (Node.js/Express/TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/    # API route handlers
│   │   │   ├── services/       # Business logic for data processing
│   │   │   ├── middleware/     # Authentication, validation, error handling
│   │   │   ├── routes/         # API route definitions
│   │   │   └── lib/            # Utilities and shared code
│   │   ├── data/               # Mock data files (BOM JSON, compliance CSV)
│   │   └── __tests__/          # Backend unit and integration tests
│   └── web/                    # Frontend (Next.js/React/TypeScript)
│       ├── src/
│       │   ├── app/            # Next.js app router pages
│       │   ├── components/     # React components
│       │   ├── contexts/       # React context providers
│       │   ├── stores/         # Zustand state management
│       │   └── lib/            # Frontend utilities and API client
│       └── __tests__/          # Frontend component tests
├── packages/
│   └── shared-types/           # Shared TypeScript types between frontend and backend
└── package.json                # Root workspace configuration
```

## API Endpoints

The backend exposes the following REST API endpoints:

### Authentication
- `POST /auth/login` - Authenticate user and receive JWT token
- `POST /auth/refresh` - Refresh existing JWT token

### Data Endpoints (All require authentication)
- `GET /bom` - Retrieve BOM data from `data/bom.json`
- `GET /compliance` - Retrieve compliance data from `data/compliance.csv`
- `GET /merged` - Get processed and merged BOM + compliance data
- `GET /health` - Health check endpoint (no auth required)

### Example API Response (GET /merged)
```json
{
  "product": "Smart Sensor",
  "components": [
    {
      "id": "P-2001",
      "substance": "Lead",
      "mass": "20g",
      "threshold_ppm": 1000,
      "status": "Non-Compliant",
      "material": "Copper"
    },
    {
      "id": "P-2002",
      "substance": "BPA",
      "mass": "10g",
      "threshold_ppm": 10,
      "status": "Non-Compliant",
      "material": "Plastic"
    }
  ]
}
```

## Data Handling

The system processes two main data sources:

1. **BOM Data** (`data/bom.json`): Contains product information and parts with materials and weights
2. **Compliance Data** (`data/compliance.csv`): Contains substance thresholds and actual measurements per part

The merge service combines this data by:
- Matching part numbers between BOM and compliance data
- Calculating PPM (parts per million) using the formula: `substance_mass_mg / (part_weight_g / 1000)`
- Determining compliance status by comparing calculated PPM against threshold values
- Handling missing compliance data with "Unknown" status
- Validating data structure using Zod schemas

## Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm

### Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Start both backend and frontend: `npm run dev`

This will start:
- Backend API on `http://localhost:4000`
- Frontend on `http://localhost:3000`

### Individual Services
- Backend only: `npm run dev:backend`
- Frontend only: `npm run dev:frontend`

### Login Credentials
- **Username**: `admin`
- **Password**: `password`

The application uses JWT-based authentication with 2-hour token expiry. Tokens are automatically refreshed when needed.

## Project Assumptions

Based on the implementation and requirements, the following assumptions were made:

1. **Data Structure Flexibility**: The compliance CSV was modified to include a `substance_mass_mg` field, which was necessary to calculate actual PPM values. The original spec only provided thresholds, but real compliance calculations require actual measured values.

2. **Token Security**: JWT secrets are hardcoded for demo purposes, assuming proper secret management in production environments.

3. **Data Validation**: All API endpoints include comprehensive input validation using Zod schemas, assuming that external data sources may not always be reliable.

4. **Error Handling**: The system assumes that missing compliance data for a part should result in "Unknown" status rather than failing the entire operation, allowing partial data processing.

5. **Unit Consistency**: The system assumes all weight data is in grams and substance measurements in milligrams, with automatic conversion to PPM calculations.

6. **File-based Storage**: The system assumes data will be read from local files rather than databases, simulating integration with external ERP/PLM systems.

7. **CORS Configuration**: The API is configured to accept requests from any origin in development, assuming the frontend and backend will be deployed separately.

8. **Data Processing Logic**: The system assumes that compliance status should be calculated in real-time rather than pre-computed, allowing for dynamic threshold updates.

9. **Frontend State Management**: The application assumes that all compliance data can be loaded into memory and managed client-side, suitable for moderate data volumes but not enterprise-scale datasets.

## Testing

The project includes comprehensive testing:
- Backend: Unit tests for controllers, services, and middleware using Jest
- Frontend: Component tests using Vitest and React Testing Library
- Run tests (from root directory, api, or web): `npm test`
- All test cases passed in the most recent check. If you're noticing test cases not passing, please check to see if you're in the right directory and that you've installed everything needed for the tests to run.

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript, JWT, Zod validation
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Zustand
- **Testing**: Jest, Vitest, React Testing Library
- **Build Tools**: TypeScript, ESLint, PostCSS
