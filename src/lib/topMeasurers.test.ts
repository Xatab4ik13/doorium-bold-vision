import { describe, expect, it } from "vitest";
import type { ApiRequest } from "@/hooks/useRequests";
import { computeTopMeasurers } from "./topMeasurers";

const request = (status: string, type: ApiRequest["type"] = "measurement", measurer_id = "one"): ApiRequest => ({
  id: `${type}-${status}`, number: "TEST", type, status, measurer_id,
  client_name: "", client_phone: "", client_address: "", source: "site", created_at: "2026-11-10",
});
const name = (id?: string) => id;

describe("measurer ranking", () => {
  it("counts measurement_done and closed measurements once each", () => {
    expect(computeTopMeasurers([request("measurement_done"), request("closed")], name)[0]?.completed).toBe(2);
  });
  it("excludes unfinished and cancelled measurements", () => {
    expect(computeTopMeasurers([request("new"), request("pending"), request("date_agreed"), request("cancelled"), request("client_refused")], name)).toEqual([]);
  });
  it("excludes installations and reclamations even with a measurer assigned", () => {
    expect(computeTopMeasurers([request("closed", "installation"), request("closed", "reclamation")], name)).toEqual([]);
  });
  it("ignores unassigned measurements and ranks by completed count", () => {
    const result = computeTopMeasurers([request("closed", "measurement", ""), request("closed", "measurement", "two"), request("closed"), request("measurement_done")], name);
    expect(result.map(({name, completed}) => ({name, completed}))).toEqual([{name:"one", completed:2}, {name:"two", completed:1}]);
  });
});