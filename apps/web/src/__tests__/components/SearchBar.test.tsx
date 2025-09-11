import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/SearchBar";

describe("SearchBar", () => {
  it("renders with placeholder text", () => {
    const mockOnChange = jest.fn();
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Search components..."
      />
    );

    expect(screen.getByPlaceholderText("Search components...")).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const mockOnChange = jest.fn();
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test search" } });

    expect(mockOnChange).toHaveBeenCalledWith("test search");
  });

  it("displays the current value", () => {
    const mockOnChange = jest.fn();
    render(<SearchBar value="current value" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("current value")).toBeInTheDocument();
  });
});
