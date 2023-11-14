import { chooseCtas } from "./rules.js";

describe("#chooseCta", () => {
  test("updates by default", () => {
    expect(chooseCtas(input())).toEqual(["updates"]);
  });

  describe("theater skipped", () => {
    test("when user in different region", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "userRegion",
            allTheatricalReleaseRegions: [
              {
                region: "anotherRegion",
              },
            ],
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("when theatrical has ended", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "matchingRegion",
            allTheatricalReleaseRegions: [
              {
                region: "matchingRegion",
                hasTheatricalEnded: true,
              },
            ],
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("when no theatrical release is planned", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "matchingRegion",
            allTheatricalReleaseRegions: [
              {
                region: "matchingRegion",
                hasTheatricalEnded: false,
              },
            ],
            filmDetails: {
              willHaveTheatricalRelease: false,
            },
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("when no theatrical date is set", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "matchingRegion",
            allTheatricalReleaseRegions: [
              {
                region: "matchingRegion",
                hasTheatricalEnded: false,
              },
            ],
            filmDetails: {
              willHaveTheatricalRelease: true,
              theatricalReleaseDate: undefined,
            },
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("when region does not have ticketPageEnabled", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "matchingRegion",
            allTheatricalReleaseRegions: [
              {
                region: "matchingRegion",
                hasTheatricalEnded: false,
                ticketPageEnabled: false,
              },
            ],
            filmDetails: {
              willHaveTheatricalRelease: true,
              theatricalReleaseDate: undefined,
            },
          }),
        ),
      ).toEqual(["updates"]);
    });
  });

  test("user in active theatrical region, film showing, release planned and dated, choose theater", () => {
    expect(
      chooseCtas(
        input({
          userRegionCode: "matchingRegion",
          allTheatricalReleaseRegions: [
            {
              region: "matchingRegion",
              hasTheatricalEnded: false,
              ticketPageEnabled: true,
            },
          ],
          filmDetails: {
            willHaveTheatricalRelease: true,
            theatricalReleaseDate: "2029-12-25",
          },
        }),
      ),
    ).toEqual(["theater"]);
  });

  describe("stream skipped", () => {
    test("project has no seasons", () => {
      expect(
        chooseCtas(
          input({
            project: {},
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("project has no episodes", () => {
      expect(
        chooseCtas(
          input({
            project: {
              seasons: [
                {
                  episodes: [],
                },
              ],
            },
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("project episode is geoblocked", () => {
      expect(
        chooseCtas(
          input({
            project: {
              seasons: [
                {
                  episodes: [
                    {
                      unavailableReason: "GEOBLOCKED",
                    },
                  ],
                },
              ],
            },
          }),
        ),
      ).toEqual(["updates"]);
    });

    test("project only has a trailer", () => {
      expect(
        chooseCtas(
          input({
            project: {
              seasons: [
                {
                  episodes: [
                    {
                      unavailableReason: null,
                      isTrailer: true,
                    },
                  ],
                },
              ],
            },
          }),
        ),
      ).toEqual(["updates"]);
    });
  });

  test("project has a streamable feature episode, choose stream", () => {
    expect(
      chooseCtas(
        input({
          project: {
            seasons: [
              {
                episodes: [
                  {
                    unavailableReason: undefined,
                    isTrailer: false,
                  },
                ],
              },
            ],
          },
        }),
      ),
    ).toEqual(["stream"]);
  });

  test("project has pifEnabled, choose pif", () => {
    expect(
      chooseCtas(
        input({
          project: { pifEnabled: true },
        }),
      ),
    ).toEqual(["pif"]);
  });

  describe("multiple ctas", () => {
    it("reorders and limits to theater and stream", () => {
      expect(
        chooseCtas(
          input({
            userRegionCode: "matchingRegion",
            allTheatricalReleaseRegions: [
              {
                region: "matchingRegion",
                hasTheatricalEnded: false,
                ticketPageEnabled: true,
              },
            ],
            filmDetails: {
              willHaveTheatricalRelease: true,
              theatricalReleaseDate: "2029-12-25",
            },
            project: {
              pifEnabled: true,
              seasons: [
                {
                  episodes: [
                    {
                      unavailableReason: undefined,
                      isTrailer: false,
                    },
                  ],
                },
              ],
            },
          }),
        ),
      ).toEqual(["stream", "theater"]);
    });
  });
});

function input(props = {}) {
  const {
    allTheatricalReleaseRegions = [],
    project = {},
    filmDetails = {},
    userRegionCode = "MX",
    ...rest
  } = props;
  return {
    userRegionCode,
    allTheatricalReleaseRegions,
    project,
    filmDetails,
    ...rest,
  };
}
