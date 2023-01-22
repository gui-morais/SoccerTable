import { NextFunction, Request, Response } from "express";
import { createMatch, eraseMatch, findMatch, updateMatch } from "../repositories/matchRepositories.js";
import { checkTeamsByName } from "../repositories/teamRepositories.js";

export async function postMatch(req: Request, res: Response, next: NextFunction) {
    const homeTeam = req.body.home as string;
    const awayTeam = req.body.away as string;

    try{
        const homeID = await checkTeamsByName(homeTeam);
        const awayID = await checkTeamsByName(awayTeam);
        if(homeID.rowCount===0 || awayID.rowCount===0) {
            return res.status(404).send("Um dos clubes não foi declarado no banco de dados.");
        }
        if(homeID.rows[0].id===awayID.rows[0].id) {
            return res.status(422).send("Não é possível criar um jogo entre a mesma equipe.");
        }

        const matches = await findMatch(homeID.rows[0].id, awayID.rows[0].id);
        if(matches.rowCount!==0) {
            return res.status(409).send("Esse jogo já foi cadastrado. Para alterar seu resultado, utilize a rota PUT.");
        }

        await createMatch(homeID.rows[0].id, awayID.rows[0].id);
        return res.sendStatus(201);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function putMatch(req: Request, res: Response) {
    const homeTeam = req.body.home as string;
    const awayTeam = req.body.away as string;
    const homeGoals = req.body.home_goals as number;
    const awayGoals = req.body.away_goals as number;

    if(homeGoals===undefined || awayGoals===undefined) {
        return res.status(422).send("É necessário informar o placar final do jogo.");
    }

    try{
        const homeID = await checkTeamsByName(homeTeam);
        const awayID = await checkTeamsByName(awayTeam);
        if(homeID.rowCount===0 || awayID.rowCount===0) {
            return res.status(404).send("Um dos clubes não foi declarado no banco de dados.");
        }

        const matches = await findMatch(homeID.rows[0].id, awayID.rows[0].id);
        if(matches.rowCount===0) {
            return res.status(404).send("Esse jogo ainda não foi cadastrado. Para introduzir um novo jogo, utilize a rota POST.");
        }

        await updateMatch(matches.rows[0].id, homeGoals, awayGoals);
        return res.sendStatus(200);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}

export async function deleteMatch(req: Request, res: Response) {
    const homeTeam = req.body.home as string;
    const awayTeam = req.body.away as string;

    try{
        const homeID = await checkTeamsByName(homeTeam);
        const awayID = await checkTeamsByName(awayTeam);
        if(homeID.rowCount===0 || awayID.rowCount===0) {
            return res.status(404).send("Um dos clubes não foi declarado no banco de dados.");
        }

        const matches = await findMatch(homeID.rows[0].id, awayID.rows[0].id);
        if(matches.rowCount===0) {
            return res.status(409).send("Esse jogo não foi encontrado no banco de dados.");
        }

        await eraseMatch(matches.rows[0].id);
        return res.sendStatus(200);
    } catch(err) {
        return res.status(500).send(err.message);
    }
}