import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const getUserLocationMock = vi.fn();

vi.mock("@/components/MapSection", () => ({
  MapSection: () => null,
}));

vi.mock("@/lib/geolocation", async () => {
  const actual = await vi.importActual<typeof import("@/lib/geolocation")>("@/lib/geolocation");

  return {
    ...actual,
    getUserLocation: () => getUserLocationMock(),
  };
});

async function renderHome() {
  const { ThemeProvider } = await import("@/app/providers");
  const { default: Home } = await import("@/app/page");
  render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

describe("Home error handling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the geolocation error visible when station data loads successfully", async () => {
    getUserLocationMock.mockRejectedValueOnce(new Error("blocked"));
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as unknown as Response);

    await renderHome();

    await waitFor(() => {
      expect(
        screen.getByText(
          /unable to access geolocation\. allow location access or set your browser permissions/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows the station data error when the station request fails", async () => {
    getUserLocationMock.mockResolvedValueOnce({ latitude: 51.5, longitude: -0.12 });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve([]),
    } as unknown as Response);

    await renderHome();

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load station data\. please try again later\./i)
      ).toBeInTheDocument();
    });
  });
});
