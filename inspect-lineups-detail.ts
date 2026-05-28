import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectLineupsDetail() {
  const matchId = 5261519;
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-hometeam-lineup?eventid=${matchId}`;
  try {
    const res = await fetch(url, { headers: { "x-rapidapi-key": rapidApiKey, "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com" } });
    const data: any = await res.json();
    if (data.response?.lineup?.starters) {
      for (const p of data.response.lineup.starters) {
        console.log(`Player: ${p.name}, PositionId: ${p.positionId}, UsualPosId: ${p.usualPlayingPositionId}, No: ${p.shirtNumber}, VertLayout:`, p.verticalLayout);
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

inspectLineupsDetail();
