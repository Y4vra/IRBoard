import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, it, expect } from "vitest"
import ErrorPage from "../pages/ErrorPage"

function renderError() {
  return render(
    <MemoryRouter initialEntries={[{
      pathname: '/error', 
      state: { errorType: 'permission' }
    }]}>
      <Routes>
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ErrorPage", () => {
  it("renders the Access Denied heading", () => {
    renderError()
    expect(screen.getByRole("heading", { name: /access denied/i })).toBeInTheDocument()
  })

  it("renders the explanation message", () => {
    renderError()
    expect(screen.getByText(/you do not have the necessary permissions/i)).toBeInTheDocument()
  })

  it("renders the Return Home button linking to /home", () => {
    renderError()
    const link = screen.getByRole("link", { name: /return home/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/home")
  })
})
