import { Request, Response } from "express";
import { deleteMatchesByTeam, matchesOfTeam } from "../repositories/matchRepositories.js";
import { checkTeamsByName, createTeam, eraseTeam, infoTeam, table } from "../repositories/teamRepositories.js";

export async function postTeam(req: Request, res: Response) {
    const teamName = req.body.name as string;
    try{
        const results = await checkTeamsByName(teamName);
        if(results.rowCount!==0) {
            return res.status(409).send("Já existe uma equipe com esse mesmo nome!");
        }
        
        await createTeam(teamName);
        return res.sendStatus(201);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function deleteTeam(req: Request, res: Response) {
    const teamName = req.body.name as string;
    try{
        const results = await checkTeamsByName(teamName);
        if(results.rowCount===0) {
            return res.status(404).send("Não existe uma equipe com esse nome.");
        }
        const teamID = results.rows[0].id;
        await deleteMatchesByTeam(teamID);
        await eraseTeam(teamID);
        return res.sendStatus(200);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function getTable(req: Request, res: Response) {
    try{
        const infos = await table();
        return res.status(200).send(infos.rows);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function getTeam(req: Request, res: Response) {
    try{
        const teamName = req.params.name;
        const infos = await infoTeam(teamName);
        return res.status(200).send(infos.rows);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function getMatchesOfTeam(req: Request, res: Response) {
    try{
        const teamName = req.params.name;
        const result = await checkTeamsByName(teamName);
        if(result.rowCount===0) {
            return res.status(404).send("Clube não encontrado no nosso banco de dados.");
        }
        const matches = await matchesOfTeam(result.rows[0].id);
        return res.status(200).send(matches.rows);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}