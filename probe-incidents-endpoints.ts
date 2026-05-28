import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function probe() {
  const matchId = 5261463;
  const potentialEndpoints = [
    `/football-get-match-incidents?eventid=${matchId}`,
    `/football-get-incidents?eventid=${matchId}`,
    `/football-get-match-incidents?id=${matchId}`,
    `/football-get-incidents?id=${matchId}`
  ];

  for (const ep of potentialEndpoints) {
    const url = `https://free-api-live-football-data.p.rapidapi.com${ep}`;
    try {
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        }
      });
      const json = await res.json();
      console.log(`Endpoint ${ep} returned:`, JSON.stringify(json));
    } catch (e: any) {
      console.log(`Endpoint ${ep} failed with error:`, e.message);
    }
  }
}

probe();
