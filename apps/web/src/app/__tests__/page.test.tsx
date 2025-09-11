import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("renders dashboard title", () => {
    render(<Home />);
    expect(screen.getByText(/Compliance Dashboard/i)).toBeInTheDocument();
  });
});


