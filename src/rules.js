const CODES = ["theater", "stream", "pif", "updates"];
const CHOOSERS = {
  theater: chooseTheater,
  stream: chooseStream,
  pif: choosePif,
  updates: chooseUpdates,
};

export function chooseCtas(input) {
  return head(CODES.filter((code) => CHOOSERS[code](input)));
}

function head(codes) {
  if (codes.includes("theater") && codes.includes("stream"))
    return ["stream", "theater"];
  return codes.slice(0, 1);
}

function chooseTheater(input) {
  if (
    input.allTheatricalReleaseRegions?.find((theatricalRegion) => {
      const isRegionOfUser = theatricalRegion.region === input.userRegionCode;
      const isStillShowing = !theatricalRegion.hasTheatricalEnded;
      const willHaveTheatricalRelease =
        input.filmDetails?.willHaveTheatricalRelease;
      const hasTheatricalDate = !!input.filmDetails?.theatricalReleaseDate;
      const isTicketPageEnabled = theatricalRegion.ticketPageEnabled;

      return (
        isRegionOfUser &&
        isStillShowing &&
        willHaveTheatricalRelease &&
        hasTheatricalDate &&
        isTicketPageEnabled
      );
    })
  )
    return "theater";
}

function chooseStream(input) {
  if (
    input.project.seasons?.at(0)?.episodes?.find((episode) => {
      const episodeExists = !!episode;
      const episodeIsPubliclyReleased =
        episode?.unavailableReason === null ||
        episode.unavailableReason === undefined;
      const episodeIsEarlyOrGuildAccess =
        episode?.unavailableReason === "PRERELEASE";
      const episodeIsTrailer = episode?.isTrailer;

      return (
        episodeExists &&
        (episodeIsPubliclyReleased || episodeIsEarlyOrGuildAccess) &&
        !episodeIsTrailer
      );
    })
  )
    return "stream";
}

function choosePif(input) {
  if (input.project.pifEnabled) return "pif";
}

function chooseUpdates(_input) {
  return "updates";
}
