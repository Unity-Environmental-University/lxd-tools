import { cellText, formatTimestamp } from "../utils";

// LISA's search timestamps: ISO 8601 in UTC, with microseconds
const LISA_TIMESTAMP = "2026-11-13T14:00:00.123456Z";

describe("formatTimestamp", () => {
  test("formats LISA's microsecond UTC timestamps in the given time zone", () => {
    expect(formatTimestamp(LISA_TIMESTAMP, "America/New_York"))
      .toMatch(/^Nov 13, 2026, 9:00\sAM$/);
  });

  test("formats whole-second timestamps", () => {
    expect(formatTimestamp("2026-07-04T16:30:00Z", "America/New_York"))
      .toMatch(/^Jul 4, 2026, 12:30\sPM$/);
  });

  test("returns anything that isn't an ISO instant unchanged", () => {
    expect(formatTimestamp("Fri, 13 Nov 2026 14:00:00 GMT")).toBe("Fri, 13 Nov 2026 14:00:00 GMT");
    expect(formatTimestamp("2026-11-13")).toBe("2026-11-13");
  });
});

describe("cellText", () => {
  test("formats *_at columns", () => {
    expect(cellText("created_at", LISA_TIMESTAMP)).not.toBe(LISA_TIMESTAMP);
    expect(cellText("created_at", LISA_TIMESTAMP)).toMatch(/^Nov 1[34], 2026, /);
  });

  test("leaves other columns as text", () => {
    expect(cellText("title", "2026-11-13T14:00:00Z")).toBe("2026-11-13T14:00:00Z");
    expect(cellText("size", 1024)).toBe("1024");
  });

  test("shows null and missing values as blank", () => {
    expect(cellText("due_at", null)).toBe("");
    expect(cellText("course_name", undefined)).toBe("");
  });
});
