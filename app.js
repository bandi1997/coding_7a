const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//API1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details;`;
  let playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachItem) => convertDbObjectToResponseObject1(eachItem))
  );
});

//API2
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `
    SELECT 
      * 
    FROM 
      player_details
    WHERE 
      player_id = ${playerId};`;
  let player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject1(district));
});

//API3
app.put("/players/:playerId/", async (request, response) => {
  let { playerName } = request.body;
  let { playerId } = request.params;
  let updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API4
app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getMatchQuery = `
    SELECT 
      * 
    FROM 
      match_details
    WHERE 
      match_id = ${matchId};`;
  let match = await database.get(getMatchQuery);
  response.send(convertDbObjectToResponseObject2(match));
});

//API5
app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerMatchesQuery = `
    SELECT 
      * 
    FROM 
     player_match_score NATURAL JOIN match_details
    WHERE 
      player_id = ${playerId};`;
  let playerMatchesArray = await database.all(getPlayerMatchesQuery);
  response.send(
    playerMatchesArray.map((eachItem) =>
      convertDbObjectToResponseObject2(eachItem)
    )
  );
});

//API6
app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let getMatchPlayersQuery = `
    SELECT 
      * 
    FROM 
     player_match_score NATURAL JOIN player_details
    WHERE 
      match_id = ${matchId};`;
  let matchPlayersArray = await database.all(getMatchPlayersQuery);
  response.send(
    matchPlayersArray.map((eachItem) =>
      convertDbObjectToResponseObject1(eachItem)
    )
  );
});

//API7
app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;
  const getPlayerScored = `
    SELECT
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
        player_details.player_id = player_match_score.player_id
    WHERE 
        player_details.player_id = ${playerId};`;
  let playerScore = await database.get(getPlayerScored);
  response.send(playerScore);
});
