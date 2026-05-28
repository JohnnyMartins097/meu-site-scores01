import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectFullDetail() {
  const matchId = 5261463;
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-match-detail?eventid=${matchId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    const data = await res.json();
    console.log("Response Keys:", Object.keys(data));
    if (data.response) {
      console.log("response level keys:", Object.keys(data.response));
      // Let's print everything under response EXCEPT detail if we want, or look at what's in there
      const otherKeys = Object.keys(data.response).filter(k => k !== "detail");
      console.log("Other keys inside response:", otherKeys);
      for (const k of otherKeys) {
        console.log(`Key ${k} value sample:`, JSON.stringify(data.response[k]).substring(0, 500));
      }
    }
  } catch (err: any) {
    console.error(err);
  }
}

inspectFullDetail();
