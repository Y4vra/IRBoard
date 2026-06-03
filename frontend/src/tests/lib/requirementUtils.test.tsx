import {
  collectPendingFRIds,
  collectPendingNFRIds,
} from "@/lib/requirementUtils"
import { describe, expect, it } from "vitest"

describe("collectPendingFRIds", () => {
  it("collects pending approval IDs from flat structure", () => {
    const reqs = [
      { id: 1, state: "PENDING_APPROVAL", children: [] },
      { id: 2, state: "ACTIVE", children: [] },
      { id: 3, state: "PENDING_APPROVAL", children: [] },
    ]

    expect(collectPendingFRIds(reqs)).toEqual([1, 3])
  })

  it("recursively collects pending IDs from nested children", () => {
    const reqs = [
      {
        id: 1,
        state: "ACTIVE",
        children: [
          {
            id: 2,
            state: "PENDING_APPROVAL",
            children: [],
          },
        ],
      },
    ]

    expect(collectPendingFRIds(reqs as any)).toEqual([2])
  })

  it("handles deep nesting correctly", () => {
    const reqs = [
      {
        id: 1,
        state: "ACTIVE",
        children: [
          {
            id: 2,
            state: "ACTIVE",
            children: [
              {
                id: 3,
                state: "PENDING_APPROVAL",
                children: [],
              },
            ],
          },
        ],
      },
    ]

    expect(collectPendingFRIds(reqs as any)).toEqual([3])
  })

  it("returns empty array when nothing is pending", () => {
    const reqs = [
      { id: 1, state: "ACTIVE", children: [] },
      { id: 2, state: "DEACTIVATED", children: [] },
    ]

    expect(collectPendingFRIds(reqs as any)).toEqual([])
  })

  it("handles missing children safely", () => {
    const reqs = [
      {
        id: 1,
        state: "PENDING_APPROVAL",
        children: undefined,
      },
    ]

    expect(collectPendingFRIds(reqs as any)).toEqual([1])
  })
})

describe("collectPendingNFRIds", () => {
  it("collects pending NFR IDs recursively", () => {
    const reqs = [
      {
        id: 10,
        state: "ACTIVE",
        children: [
          {
            id: 11,
            state: "PENDING_APPROVAL",
            children: [],
          },
        ],
      },
    ]

    expect(collectPendingNFRIds(reqs as any)).toEqual([11])
  })

  it("handles multiple branches", () => {
    const reqs = [
      {
        id: 1,
        state: "ACTIVE",
        children: [
          { id: 2, state: "PENDING_APPROVAL", children: [] },
          { id: 3, state: "PENDING_APPROVAL", children: [] },
        ],
      },
    ]

    expect(collectPendingNFRIds(reqs as any)).toEqual([2, 3])
  })

  it("handles deeply nested mixed states", () => {
    const reqs = [
      {
        id: 1,
        state: "PENDING_APPROVAL",
        children: [
          {
            id: 2,
            state: "ACTIVE",
            children: [
              {
                id: 3,
                state: "PENDING_APPROVAL",
                children: [],
              },
            ],
          },
        ],
      },
    ]

    expect(collectPendingNFRIds(reqs as any)).toEqual([1, 3])
  })

  it("returns empty array when no NFRs are pending", () => {
    const reqs = [
      { id: 1, state: "ACTIVE", children: [] },
      { id: 2, state: "ACTIVE", children: [] },
    ]

    expect(collectPendingNFRIds(reqs as any)).toEqual([])
  })
})