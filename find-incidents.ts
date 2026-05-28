import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function findIncidents() {
  const dateStr = "20260527";
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=${dateStr}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    const data: any = await res.json();
    let matches: any[] = [];
    if (data.response && Array.isArray(data.response)) {
      matches = data.response;
    } else if (data.response && data.response.matches) {
      matches = data.response.matches;
    }
    
    // Find finished matches with goals
    const finishedMatchesWithGoals = matches.filter(m => {
      const isFinished = m.status?.finished === true;
      const totalGoals = (m.home?.score || 0) + (m.away?.score || 0);
      return isFinished && totalGoals > 0;
    });

    console.log(`Found ${finishedMatchesWithGoals.length} finished matches with goals.`);
    if (finishedMatchesWithGoals.length === 0) {
      console.log("No finished matches with goals found. Trying any match with goals...");
      const matchesWithGoals = matches.filter(m => {
        const totalGoals = (m.home?.score || 0) + (m.away?.score || 0);
        return totalGoals > 0;
      });
      console.log(`Found ${matchesWithGoals.length} total matches with goals.`);
      if (matchesWithGoals.length > 0) {
        await inspectMatch(matchesWithGoals[0].id);
      }
    } else {
      await inspectMatch(finishedMatchesWithGoals[0].id);
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

async function inspectMatch(matchId: number) {
  console.log(`Inspecting match ID: ${matchId}`);
  const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-match-detail?eventid=${matchId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    const data: any = await res.json();
    console.log("Response root keys:", Object.keys(data));
    if (data.response) {
      console.log("response keys:", Object.keys(data.response));
      if (data.response.detail) {
        console.log("detail keys:", Object.keys(data.response.detail));
      }
      console.log("Full response object keys & types:");
      for (const k of Object.keys(data.response)) {
        console.log(`- ${k}: ${typeof data.response[k]}`);
        if (Array.isArray(data.response[k])) {
          console.log(`  (Array of length ${data.response[k].length})`);
          if (data.response[k].length > 0) {
            console.log("  Sample item:", JSON.stringify(data.response[k][0]).substring(0, 300));
          }
        } else if (typeof data.response[k] === "object") {
          console.log(`  Keys:`, Object.keys(data.response[k]));
        }
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

findIncidents();
