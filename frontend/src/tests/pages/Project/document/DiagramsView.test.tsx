import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import DiagramsView from "@/pages/Project/document/DiagramsView"

// ─── Mocks ───────────────────────────────────────────────

// router param
vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "p1" }),
}))

// simple stub for BackToProjectButton
vi.mock("@/components/BackToProjectButton", () => ({
  BackToProjectButton: () => <div data-testid="back-btn" />,
}))

// UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

describe("DiagramsView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders template grid initially", () => {
    render(<DiagramsView />)

    expect(screen.getByText("Diagrams")).toBeInTheDocument()
    expect(screen.getByText("Blank diagram")).toBeInTheDocument()
    expect(screen.getByText("Use case diagram")).toBeInTheDocument()
    expect(screen.getByText("Class diagram")).toBeInTheDocument()
  })

  it("filters templates by category", () => {
    render(<DiagramsView />)

    fireEvent.click(screen.getByRole("button", { name: "Architecture" }))

    // only component diagram should remain visible
    expect(screen.getByText("Component diagram")).toBeInTheDocument()
  })

  it("opens editor when template is selected", () => {
    render(<DiagramsView />)

    fireEvent.click(screen.getByText("Use case diagram"))

    expect(screen.getByRole("button", { name: /download \.drawio/i })).toBeInTheDocument()
    expect(screen.getByText("Template")).toBeInTheDocument()
  })

  it("shows iframe with draw.io URL when template selected", () => {
    render(<DiagramsView />)

    fireEvent.click(screen.getByText("Blank diagram"))

    const iframe = screen.getByTitle(/draw\.io/i)
    expect(iframe).toBeInTheDocument()
    expect(iframe.getAttribute("src")).toContain("embed=1")
  })

  it("closes editor and returns to grid", () => {
    render(<DiagramsView />)

    fireEvent.click(screen.getByText("Blank diagram"))
    fireEvent.click(screen.getByRole("button", { name: /x/i }))

    expect(screen.getByText("Use case diagram")).toBeInTheDocument()
  })

  it("updates diagram name input", () => {
    render(<DiagramsView />)

    fireEvent.click(screen.getByText("Blank diagram"))

    const input = screen.getByPlaceholderText("diagram-name")
    fireEvent.change(input, { target: { value: "my-diagram" } })

    expect((input as HTMLInputElement).value).toBe("my-diagram")
  })
})