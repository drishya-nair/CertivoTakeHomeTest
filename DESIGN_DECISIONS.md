# Design Decisions for Certivo Compliance Dashboard

## Overview

This document outlines the key design decisions made during the development of the Certivo Compliance Dashboard, explaining the reasoning behind each choice and how it contributes to the overall system architecture.

## Core Business Logic Decisions

### Adding Substance Mass Data to Enable Compliance Calculations

**Decision**: Include substance mass information in the merged data structure to enable compliance status calculations.

**Why**: The compliance calculations require both substance mass and part weight to determine ppm values (substance_mass_mg ÷ part_weight_kg). Without the substance mass data being available in the merged response, it would be impossible to calculate or verify compliance status. The original data sources had this information separately, but the merged response needed to include it to make compliance calculations possible.

**Implementation**: The `MergeService` uses the `substance_mass_mg` from the compliance CSV data during the merge process to calculate ppm values and determine compliance status. This ensures the final response contains all necessary data for compliance analysis.

**Benefits**: 
- Enables accurate compliance calculations using actual substance mass data
- Makes the API response complete with all necessary compliance information
- Allows verification of compliance calculations on the frontend if needed
- Provides transparency into the data used for compliance decisions

### Three-Tier Status System

**Decision**: Use three compliance statuses: "Compliant", "Non-Compliant", and "Unknown".

**Why**: Real-world compliance data often has gaps. Components might not have compliance data available, or the data might be incomplete. The "Unknown" status provides transparency about data quality issues while allowing the system to continue functioning.

**Benefits**:
- Clear communication about data completeness
- Prevents false positives or negatives due to missing data
- Enables users to identify which components need additional compliance testing
- Supports gradual data improvement over time

## Authentication & Security Decisions

### Adding JWT-Based Authentication

**Decision**: Implement a complete authentication system with JWT tokens, even though it wasn't explicitly required.

**Why**: Compliance data is sensitive business information that should be protected. A professional dashboard requires proper authentication to demonstrate security awareness and provide a realistic user experience. The JWT approach scales well and doesn't require server-side session storage.

**Implementation**: 
- JWT tokens with 2-hour expiration
- Secure credential verification using SHA-256 hashing with constant-time comparison
- Token refresh mechanism
- Protected routes on both frontend and backend
- Demo credentials for easy testing

**Benefits**:
- Demonstrates security best practices
- Provides foundation for role-based access control
- Stateless authentication enables horizontal scaling
- Professional user experience with proper session management

### Demo Credentials Display

**Decision**: Show demo credentials directly in the login form interface.

**Why**: This is a take-home assignment that needs to be easily testable. Hard-coding credentials or requiring setup documentation would create unnecessary friction for evaluators. Displaying credentials in the UI makes the system immediately usable.

**Benefits**:
- Zero setup required for testing
- Clear communication that this is a demo system
- Professional appearance while being practical
- Easy credential discovery without documentation

## User Experience Decisions

### Keeping Details Pages Despite Optional Requirement

**Decision**: Maintain detailed component pages even though they were marked as optional and could be removed.

**Why**: Details pages provide essential value for compliance management. Users need to drill down into specific components to understand why something is non-compliant, view exact ppm values, and access additional context. Removing this functionality would significantly reduce the system's practical utility.

**Implementation**: 
- Dedicated route for each component with URL-based navigation
- Comprehensive component information display
- Proper error handling for invalid component IDs
- Consistent navigation patterns with back buttons

**Benefits**:
- Complete user workflow for compliance analysis
- Professional application depth beyond basic dashboard
- Demonstrates understanding of real-world compliance workflows
- Provides foundation for future features like compliance history

### Dark Mode Implementation

**Decision**: Implement a comprehensive dark mode system using next-themes.

**Why**: Modern applications should support user preferences for accessibility and comfort. Dark mode is especially important for dashboard applications that users might use for extended periods. The implementation demonstrates attention to user experience details.

**Implementation**:
- System preference detection with manual override
- Consistent theming across all components
- Smooth transitions between themes
- Persistent theme selection

**Benefits**:
- Improved accessibility and user comfort
- Professional polish and attention to detail
- Demonstrates modern UX best practices
- Reduces eye strain during extended use

## Technical Architecture Decisions

### Monorepo Structure with Workspaces

**Decision**: Organize the project as a monorepo with separate apps for API and web, plus shared types package.

**Why**: This structure provides clear separation of concerns while enabling code sharing. The shared-types package ensures type safety between frontend and backend, preventing API contract mismatches. Workspaces enable efficient dependency management and unified development workflows.

**Benefits**:
- Type safety across the entire stack
- Single repository for easier development and deployment
- Shared tooling and configuration
- Clear separation between API and frontend concerns
- Easy to add additional apps or packages in the future

### Service-Oriented Backend Architecture

**Decision**: Organize backend code into controllers, services, and middleware with clear separation of concerns.

**Why**: This architecture makes the codebase maintainable and testable. Services contain business logic, controllers handle HTTP concerns, and middleware provides cross-cutting functionality like authentication and error handling. This separation makes it easy to modify business logic without affecting API structure.

**Implementation**:
- `BomService` and `ComplianceService` for data access
- `MergeService` for business logic
- Controllers for HTTP request/response handling
- Middleware for authentication, validation, and error handling

**Benefits**:
- Easy to unit test individual components
- Clear responsibility boundaries
- Simple to modify business logic without affecting API
- Reusable services across different controllers

### Zustand for State Management

**Decision**: Use Zustand instead of Redux or Context API for frontend state management.

**Why**: Zustand provides a simpler API than Redux while being more performant than Context API for frequent updates. It's perfect for this application's state management needs without the complexity overhead of Redux. The compliance store handles API data, loading states, and filtering efficiently.

**Benefits**:
- Minimal boilerplate compared to Redux
- Better performance than Context API
- Simple testing with clear state updates
- Easy to understand and maintain

### Comprehensive Error Handling

**Decision**: Implement structured error handling with proper HTTP status codes and user-friendly messages.

**Why**: Good error handling is crucial for production applications. Users need clear feedback when things go wrong, and developers need detailed information for debugging. The system handles various error scenarios gracefully without crashing.

**Implementation**:
- Custom error creation with appropriate HTTP status codes
- Error boundary components for React error catching
- Structured error logging for debugging
- User-friendly error messages in the UI

**Benefits**:
- Better user experience with clear error communication
- Easier debugging with detailed error information
- Graceful degradation when components fail
- Professional error handling patterns

## Data Processing Decisions

### Streaming CSV Processing

**Decision**: Use Node.js streams for CSV processing instead of loading entire files into memory.

**Why**: CSV files can be large, and loading them entirely into memory could cause performance issues or crashes. Streaming allows processing files larger than available RAM and provides better performance for large datasets.

**Benefits**:
- Memory efficient for large files
- Better performance with large datasets
- Prevents out-of-memory errors
- Scalable approach for production use

### Data Validation with Zod

**Decision**: Use Zod for runtime data validation in addition to TypeScript compile-time checking.

**Why**: Runtime validation catches data quality issues that TypeScript cannot detect. When processing external data sources like CSV files, validation ensures the application behaves predictably even with malformed data.

**Benefits**:
- Catches data quality issues at runtime
- Prevents crashes from unexpected data formats
- Clear error messages for data validation failures
- Type-safe validation schemas

## Testing Strategy Decisions

### Comprehensive Test Coverage

**Decision**: Implement unit tests, integration tests, and component tests across both frontend and backend.

**Why**: Testing demonstrates code quality and ensures reliability. The test suite covers business logic, API endpoints, React components, and user interactions. This comprehensive approach catches bugs early and provides confidence in system behavior.

**Implementation**:
- Backend: Jest with unit tests for services and integration tests for API endpoints
- Frontend: Vitest with component tests using React Testing Library
- Mock data and API responses for consistent testing
- Error scenario testing

**Benefits**:
- Catches regressions during development
- Documents expected behavior
- Enables confident refactoring
- Demonstrates testing best practices

## Development Experience Decisions

### Single Command Development

**Decision**: Set up root-level npm scripts to run both backend and frontend concurrently.

**Why**: Development efficiency requires easy startup of the entire system. The root package.json with workspaces and concurrently enables running both services with a single command, improving the developer experience.

**Benefits**:
- Single command to start entire development environment
- Clear separation of services with colored output
- Easy to add additional services in the future
- Improved developer productivity

### TypeScript Throughout

**Decision**: Use TypeScript for both frontend and backend development.

**Why**: TypeScript provides compile-time type checking, better IDE support, and catches errors early in development. The shared-types package ensures type consistency across the entire application.

**Benefits**:
- Compile-time error detection
- Better IDE support with autocomplete and refactoring
- Self-documenting code with type annotations
- Prevents runtime type errors

These design decisions collectively create a professional, maintainable, and user-friendly compliance dashboard that demonstrates modern full-stack development practices while solving real business problems.
