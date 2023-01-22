import { connection } from "../database/db.js";

export async function checkTeamsByName(teamName: string) {
    return connection.query("SELECT id FROM teams WHERE name ILIKE $1", [teamName]);
}

export async function createTeam(teamName: string) {
    await connection.query("INSERT INTO teams (name) VALUES ($1);", [teamName]);
}

export async function eraseTeam(team: number) {
    connection.query("DELETE FROM teams WHERE id = $1;", [team]);
}

export async function table() {
    return await connection.query(`SELECT 
    teams.name AS club, 
    SUM(CASE
        WHEN matches.is_finished = true THEN 1
        ELSE 0 END)
    AS played, 
    SUM(CASE 
        WHEN teams.id = matches.home AND matches.is_finished = true THEN matches.home_goals
        WHEN teams.id = matches.away AND matches.is_finished = true THEN matches.away_goals
        ELSE 0 END)
    AS goals_for,
    SUM(CASE 
        WHEN teams.id = matches.home AND matches.is_finished = true THEN matches.away_goals
        WHEN teams.id = matches.away AND matches.is_finished = true THEN matches.home_goals
        ELSE 0 END)
    AS goals_against,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals > matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals > matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS wons,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals = matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals = matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS drawns,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals < matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals < matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS losts
    FROM teams JOIN matches ON teams.id = matches.home OR teams.id = matches.away
    GROUP BY teams.id ORDER BY teams.id;`);
}

export async function infoTeam(teamName: string) {
    return await connection.query(`SELECT 
    teams.name AS club, 
    SUM(CASE
        WHEN matches.is_finished = true THEN 1
        ELSE 0 END)
    AS played, 
    SUM(CASE 
        WHEN teams.id = matches.home AND matches.is_finished = true THEN matches.home_goals
        WHEN teams.id = matches.away AND matches.is_finished = true THEN matches.away_goals
        ELSE 0 END)
    AS goals_for,
    SUM(CASE 
        WHEN teams.id = matches.home AND matches.is_finished = true THEN matches.away_goals
        WHEN teams.id = matches.away AND matches.is_finished = true THEN matches.home_goals
        ELSE 0 END)
    AS goals_against,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals > matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals > matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS wons,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals = matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals = matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS drawns,
    SUM(CASE
        WHEN (teams.id = matches.home AND matches.home_goals < matches.away_goals) AND matches.is_finished = true THEN 1
        WHEN (teams.id = matches.away AND matches.away_goals < matches.home_goals) AND matches.is_finished = true THEN 1
        ELSE 0 END)
    AS losts
    FROM teams JOIN matches ON teams.id = matches.home OR teams.id = matches.away
    WHERE teams.name ILIKE $1
    GROUP BY teams.id;`, [teamName]);
}