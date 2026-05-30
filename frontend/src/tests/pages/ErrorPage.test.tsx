import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ErrorPage from "../../pages/ErrorPage"

function renderError() {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/error",
          state: { errorType: "permission" },
        },
      ]}
    >
      <Routes>
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ErrorPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the Access Denied heading", () => {
    renderError()
    expect(
      screen.getByRole("heading", { name: /access denied/i })
    ).toBeInTheDocument()
  })

  it("renders the explanation message", () => {
    renderError()
    expect(
      screen.getByText(/you do not have the necessary permissions/i)
    ).toBeInTheDocument()
  })

  it("calls window.location.replace when Return Home is clicked", () => {
    const replaceMock = vi.fn()
    vi.stubGlobal("window", {
      ...window,
      location: {
        ...window.location,
        replace: replaceMock,
      },
    })

    renderError()

    const button = screen.getByRole("button", { name: /return home/i })
    button.click()

    expect(replaceMock).toHaveBeenCalledWith("/home")
  })
})