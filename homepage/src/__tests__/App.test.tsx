import { render, screen } from "@testing-library/react";
import App from "../App";

describe("Altair homepage", () => {
  it("renders key sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /local services platform powered with ai/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/what we offer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start an enquiry/i })).toBeInTheDocument();
  });
});
