import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Mock the compliance store
jest.mock("@/stores/complianceStore", () => ({
  useComplianceStore: () => ({
    merged: null,
    loading: false,
    error: null,
    fetchMerged: jest.fn(),
    login: jest.fn(),
    filter: "",
    setFilter: jest.fn(),
  }),
}));

describe("Dashboard Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    
    expect(screen.getByText("Compliance Dashboard")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<Home />);
    
    expect(screen.getByPlaceholderText("Search by part or status...")).toBeInTheDocument();
  });

  it("renders the dark mode toggle", () => {
    render(<Home />);
    
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });
});
