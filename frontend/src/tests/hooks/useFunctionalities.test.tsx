import { renderHook } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useFunctionalities } from "@/hooks/useFunctionalities"
import { FunctionalitiesContext } from "@/context/FunctionalitiesContextInstance"
import React from "react"

// ── helper provider wrapper ───────────────────────────────────────────────────

function wrapper({ value }: any) {
  return ({ children }: any) =>
    React.createElement(
      FunctionalitiesContext.Provider,
      { value },
      children
    )
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useFunctionalities", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useFunctionalities())
    }).toThrow("useFunctionalities must be used within a FunctionalitiesProvider")
  })

  it("returns context when provided", () => {
    const contextValue = {
      functionalities: {
        edit: [{ id: 1 }, { id: 2 }],
      },
    }

    const { result } = renderHook(() => useFunctionalities(), {
      wrapper: wrapper({ value: contextValue }),
    })

    expect(result.current.functionalities!.edit).toHaveLength(2)
  })

  it("canEditFunctionality returns true when id exists", () => {
    const contextValue = {
      functionalities: {
        edit: [{ id: 10 }, { id: 20 }],
      },
    }

    const { result } = renderHook(() => useFunctionalities(), {
      wrapper: wrapper({ value: contextValue }),
    })

    expect(result.current.canEditFunctionality(10)).toBe(true)
    expect(result.current.canEditFunctionality("20")).toBe(true)
  })

  it("canEditFunctionality returns false when id not found", () => {
    const contextValue = {
      functionalities: {
        edit: [{ id: 1 }, { id: 2 }],
      },
    }

    const { result } = renderHook(() => useFunctionalities(), {
      wrapper: wrapper({ value: contextValue }),
    })

    expect(result.current.canEditFunctionality(999)).toBe(false)
  })

  it("returns false when edit list is undefined", () => {
    const contextValue = {
      functionalities: {},
    }

    const { result } = renderHook(() => useFunctionalities(), {
      wrapper: wrapper({ value: contextValue }),
    })

    expect(result.current.canEditFunctionality(1)).toBe(false)
  })

  it("handles empty context arrays safely", () => {
    const contextValue = {
      functionalities: {
        edit: [],
      },
    }

    const { result } = renderHook(() => useFunctionalities(), {
      wrapper: wrapper({ value: contextValue }),
    })

    expect(result.current.canEditFunctionality(1)).toBe(false)
  })
})