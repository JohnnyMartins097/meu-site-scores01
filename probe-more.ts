import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function probeMore() {
  const matchId = 5261463;
  const list = [
    "/football-get-event-incidents",
    "/football-get-event-events",
    "/football-get-match-events-list",
    "/football-get-match-incident-list",
    "/football-get-event-incidents-list",
    "/football-get-match-timelines",
    "/football-get-match-history",
    "/football-get-all-incidents",
    "/football-get-match-commentary",
    "/football-get-comments"
  ];

  for (const ep of list) {
    const url = `https://free-api-live-football-data.p.rapidapi.com${ep}?eventid=${matchId}`;
    try {
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        }
      });
      const data = await res.json();
      console.log(`Endpoint: ${ep} =>`, JSON.stringify(data).substring(0, 200));
    } catch (e: any) {
      console.log(`Endpoint: ${ep} failed =>`, e.message);
    }
  }
}

probeMore();
