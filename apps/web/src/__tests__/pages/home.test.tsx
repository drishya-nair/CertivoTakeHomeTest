import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Mock the ProtectedRoute to avoid auth complexity in tests
jest.mock("@/components/ProtectedRoute", () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock the Dashboard component
jest.mock("@/components/Dashboard", () => {
  return function MockDashboard() {
    return <div>Compliance Dashboard</div>;
  };
});

describe("Home page", () => {
  it("renders dashboard title", () => {
    render(<Home />);
    expect(screen.getByText(/Compliance Dashboard/i)).toBeInTheDocument();
  });

  it("wraps dashboard in ProtectedRoute", () => {
    render(<Home />);
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
  });
});
