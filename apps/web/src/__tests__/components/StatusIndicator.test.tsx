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

  it("hides text when showText is false", () => {
    render(<StatusIndicator status="Compliant" showText={false} />);
    
    expect(screen.queryByText("Compliant")).not.toBeInTheDocument();
    expect(screen.getByTitle("Compliant")).toBeInTheDocument();
  });
});
