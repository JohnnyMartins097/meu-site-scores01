import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectLineups() {
  const matchId = 5261519; // Finished match with lineups
  const endpoints = [
    `/football-get-hometeam-lineup?eventid=${matchId}`,
    `/football-get-awayteam-lineup?eventid=${matchId}`
  ];

  for (const path of endpoints) {
    const url = `https://free-api-live-football-data.p.rapidapi.com${path}`;
    try {
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        }
      });
      const data: any = await res.json();
      console.log(`Endpoint ${path}:`, Object.keys(data));
      if (data.response) {
        console.log(`- response keys:`, Object.keys(data.response));
        const keys = Object.keys(data.response);
        for (const k of keys) {
          console.log(`  - ${k}: ${typeof data.response[k]}`);
          if (typeof data.response[k] === "object" && data.response[k] !== null) {
            console.log(`    - nested keys for ${k}:`, Object.keys(data.response[k]));
          }
        }
      }
    } catch (e: any) {
      console.error(`Failed ${path}:`, e.message);
    }
  }
}

inspectLineups();
