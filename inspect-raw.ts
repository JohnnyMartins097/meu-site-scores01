import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";

async function inspectRaw() {
  const url = "https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=20260527";
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });
    console.log("Status:", res.status);
    const data: any = await res.json();
    console.log("Raw Response Keys:", Object.keys(data));
    
    let matches: any[] = [];
    if (data.response && Array.isArray(data.response)) {
      matches = data.response;
    } else if (data.response && data.response.matches) {
      matches = data.response.matches;
    } else if (Array.isArray(data)) {
      matches = data;
    } else {
      const keys = Object.keys(data);
      for (const k of keys) {
        if (Array.isArray(data[k])) {
          matches = data[k];
          break;
        }
      }
    }
    
    console.log("Number of matches found:", matches.length);
    if (matches.length > 0) {
      const sample = matches[0];
      console.log("Sample Match Keys:", Object.keys(sample));
      console.log("Sample Match Details:", JSON.stringify(sample, null, 2));
    }
  } catch (err: any) {
    console.error("Error inspecting raw:", err.message);
  }
}

inspectRaw();
