import { trace } from "@opentelemetry/api";
import { correlationFields, getRequestContext } from "./request-context";

describe("request-context", () => {
  describe("getRequestContext()", () => {
    it("should return default values when no active span exists", () => {
      jest.spyOn(trace, "getSpan").mockReturnValue(undefined);

      const ctx = getRequestContext();

      expect(ctx.requestId).toBeDefined();
      expect(ctx.traceId).toBe("no-trace");
      expect(ctx.spanId).toBe("no-span");
    });

    it("should use the provided requestId", () => {
      jest.spyOn(trace, "getSpan").mockReturnValue(undefined);

      const ctx = getRequestContext("custom-request-id");

      expect(ctx.requestId).toBe("custom-request-id");
    });

    it("should extract trace and span IDs from active span", () => {
      const mockSpanContext = {
        traceId: "abc123",
        spanId: "def456",
        traceFlags: 0,
      };
      const mockSpan = { spanContext: () => mockSpanContext } as any;
      jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan);

      const ctx = getRequestContext();

      expect(ctx.traceId).toBe("abc123");
      expect(ctx.spanId).toBe("def456");
    });
  });

  describe("correlationFields()", () => {
    it("should return structured log fields from context", () => {
      const ctx = { requestId: "req-1", traceId: "trace-1", spanId: "span-1" };

      const fields = correlationFields(ctx);

      expect(fields).toEqual({
        requestId: "req-1",
        traceId: "trace-1",
        spanId: "span-1",
      });
    });
  });
});
