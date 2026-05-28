import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectStats() {
  const matchId = 5261519; // Finished with goals
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-match-all-stats?eventid=${matchId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    const data: any = await res.json();
    console.log("Stats root keys:", Object.keys(data));
    if (data.response) {
      console.log("response keys:", Object.keys(data.response));
      if (data.response.stats) {
        console.log("stats class/type:", typeof data.response.stats);
        if (Array.isArray(data.response.stats)) {
          console.log("stats array length:", data.response.stats.length);
          if (data.response.stats.length > 0) {
            console.log("Sample stat item:", JSON.stringify(data.response.stats[0]).substring(0, 400));
          }
        } else {
          console.log("stats keys:", Object.keys(data.response.stats));
          console.log("stats sample:", JSON.stringify(data.response.stats).substring(0, 400));
        }
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

inspectStats();
