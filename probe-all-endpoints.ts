import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function probeAll() {
  const matchId = 5261463;
  const list = [
    "/football-get-match-events",
    "/football-get-events",
    "/football-get-timeline",
    "/football-get-match-timeline",
    "/football-get-incidents-all",
    "/football-get-match-incidents-all",
    "/football-get-match-incident",
    "/football-get-incident",
    "/football-get-incidents-list",
    "/football-get-match-incidents-list",
    "/football-get-incidents-by-match",
    "/football-get-match-highlights"
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

probeAll();
