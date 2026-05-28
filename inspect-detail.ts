import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectDetail() {
  const matchId = 5261463; // Estudiantes vs Independiente Medellin
  const endpoints = [
    `/football-get-match-detail?eventid=${matchId}`,
    `/football-get-match-all-stats?eventid=${matchId}`,
    `/football-get-hometeam-lineup?eventid=${matchId}`
  ];

  for (const endpoint of endpoints) {
    const url = `https://free-api-live-football-data.p.rapidapi.com${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        }
      });
      const data = await res.json();
      console.log(`=== Endpoint: ${endpoint} ===`);
      console.log("Response Keys:", Object.keys(data));
      if (data.response) {
        console.log("response type/keys:", typeof data.response, Object.keys(data.response));
        // print a small sample of response
        console.log("Response sample:", JSON.stringify(data.response).substring(0, 1000));
      } else {
        console.log("No 'response' key. Full response keys:", Object.keys(data));
        console.log("Response sample:", JSON.stringify(data).substring(0, 1000));
      }
    } catch (err: any) {
      console.error(`Error on ${endpoint}:`, err.message);
    }
  }
}

inspectDetail();
