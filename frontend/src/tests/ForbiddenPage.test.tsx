import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect } from "vitest"
import Forbidden from "../pages/ForbiddenPage"

function renderForbidden() {
  return render(
    <MemoryRouter>
      <Forbidden />
    </MemoryRouter>
  )
}

describe("ForbiddenPage", () => {
  it("renders the Access Denied heading", () => {
    renderForbidden()
    expect(screen.getByRole("heading", { name: /access denied/i })).toBeInTheDocument()
  })

  it("renders the explanation message", () => {
    renderForbidden()
    expect(screen.getByText(/you do not have the necessary permissions/i)).toBeInTheDocument()
  })

  it("renders the Return Home button linking to /home", () => {
    renderForbidden()
    const link = screen.getByRole("link", { name: /return home/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/home")
  })
})
