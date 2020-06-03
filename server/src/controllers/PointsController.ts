import { Request, Response } from 'express'
import knex from '../database/connection'

export default class PointController {
    async index(request: Request, response: Response) {
        const { uf, city, items } = request.query

        const parsedItems = String(items).split(',')
            .map(item => Number(item.trim()))

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.items_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        if (!points) {
            return response.status(400).json({
                message: 'Nof Found'
            })
        }
        return response.json(points);
    }
    async create(request: Request, response: Response) {
        const { image, name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

        const point = {
            image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const trx = await knex.transaction()

        const insertedIds = await trx('points').insert(point)
        // console.log(insertedIds)
        const point_id = insertedIds[0];

        const pointItems = items.map((items_id: number) => {
            return {
                items_id,
                point_id
            }
        })

        await trx('point_items').insert(pointItems)
        await trx.commit()
        return response.json({ id: point_id, ...point, })
    }

    async show(request: Request, response: Response) {
        const { id } = request.params

        const listItems = await knex('points').where('id', id).first();

        if (!listItems) {
            return response.status(400).json({
                message: 'Point not found'
            })
        }
        const items = await knex('items').join('point_items', 'items.id', '=', 'point_items.items_id')
            .where('point_items.point_id', id)

        if (!items) {
            return response.status(400).json({
                message: 'Items not found'
            })
        }
        return response.json({ items, listItems })

    }
}