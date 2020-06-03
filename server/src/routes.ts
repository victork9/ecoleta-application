import express from 'express'

import PointController from './controllers/PointsController';
import ItemsController from './controllers/itemsController';

const routes = express.Router()
const Items = new ItemsController()
const Point = new PointController()

routes.get('/items', Items.index)

routes.post('/points',Point.create)
routes.get('/points',Point.index)
routes.get('/points/:id',Point.show)
   

export default routes;