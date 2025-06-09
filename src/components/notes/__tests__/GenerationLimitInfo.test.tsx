import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import GenerationLimitInfo from "../GenerationLimitInfo";

describe("GenerationLimitInfo", () => {
  it("renders remaining generations count", () => {
    render(<GenerationLimitInfo remainingGenerations={5} />);

    expect(screen.getByText(/Pozostało 5 generowań/)).toBeInTheDocument();
  });

  it("shows reset time when provided", () => {
    render(<GenerationLimitInfo remainingGenerations={3} resetTime="23:59" />);

    expect(screen.getByText(/Pozostało 3 generowań \(reset o 23:59\)/)).toBeInTheDocument();
  });

  it("shows hover card with limit information on hover", async () => {
    const user = userEvent.setup();
    render(<GenerationLimitInfo remainingGenerations={2} />);

    const infoIcon = screen.getByRole("button");
    await user.hover(infoIcon);

    expect(screen.getByText("Limit generowania planów")).toBeInTheDocument();
    expect(screen.getByText("Limit jest odnawiany codziennie o północy.")).toBeInTheDocument();
  });
});
