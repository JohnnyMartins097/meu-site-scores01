import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectPlayersList() {
  const matchId = 5261519;
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-hometeam-lineup?eventid=${matchId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    const data: any = await res.json();
    if (data.response && data.response.lineup) {
      const lineup = data.response.lineup;
      console.log("Lineup keys:", Object.keys(lineup));
      console.log("Formation:", lineup.formation);
      console.log("Coach:", lineup.coach);
      console.log("Average starter age:", lineup.averageStarterAge);
      if (Array.isArray(lineup.starters)) {
        console.log(`Starters count: ${lineup.starters.length}`);
        if (lineup.starters.length > 0) {
          console.log("Sample starter player:", JSON.stringify(lineup.starters[0]));
        }
      }
      if (Array.isArray(lineup.subs)) {
        console.log(`Subs count: ${lineup.subs.length}`);
        if (lineup.subs.length > 0) {
          console.log("Sample sub player:", JSON.stringify(lineup.subs[0]));
        }
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

inspectPlayersList();
