import { render, screen } from "@testing-library/react";
import StatusIndicator from "@/components/StatusIndicator";

describe("StatusIndicator", () => {
  it("renders compliant status correctly", () => {
    render(<StatusIndicator status="Compliant" />);
    
    expect(screen.getByText("Compliant")).toBeInTheDocument();
    expect(screen.getByTitle("Compliant")).toBeInTheDocument();
  });

  it("renders non-compliant status correctly", () => {
    render(<StatusIndicator status="Non-Compliant" />);
    
    expect(screen.getByText("Non-Compliant")).toBeInTheDocument();
    expect(screen.getByTitle("Non-Compliant")).toBeInTheDocument();
  });

  it("renders unknown status correctly", () => {
    render(<StatusIndicator status="Unknown" />);
    
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByTitle("Unknown")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<StatusIndicator status="Compliant" size="sm" />);
    expect(screen.getByText("Compliant")).toBeInTheDocument();
    
    rerender(<StatusIndicator status="Compliant" size="lg" />);
    expect(screen.getByText("Compliant")).toBeInTheDocument();
  });
});
