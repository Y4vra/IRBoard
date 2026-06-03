import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import React from "react"
import { useLocks } from "@/hooks/useLocks"
import { LockContext } from "@/context/LockContextInstance"

function wrapper(value: any) {
  return ({ children }: any) =>
    React.createElement(
      LockContext.Provider,
      { value },
      children
    )
}

describe("useLocks", () => {
  it("returns context value when used inside provider", () => {
    const ctxValue = {
      getLock: (id: string) => `lock-${id}`,
      locks: { "1": "locked" } as  Map<string, EntityLockDTO>,
    }

    const { result } = renderHook(() => useLocks(), {
      wrapper: wrapper(ctxValue),
    })

    expect(result.current).toEqual(ctxValue)
    expect(result.current.getLock("123")).toBe("lock-123")
  })

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useLocks())
    }).toThrow("useLocks must be used inside <LockProvider>")
  })

  it("does not modify context reference", () => {
    const ctxValue = {
      getLock: vi.fn(),
      locks: {},
    }

    const { result } = renderHook(() => useLocks(), {
      wrapper: wrapper(ctxValue),
    })

    expect(result.current).toBe(ctxValue)
  })
})