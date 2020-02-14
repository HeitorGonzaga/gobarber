import {startOfDay, endOfDay, parseISO } from 'date-fns';
import {Op} from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController{

    async index(req, res){
        const {page = 1} = req.query;

        /**
         * Check user is provider
         */

        const checkIsProvider = await User.findOne({
            where: {id: req.userId, provider:true}
        });

        if(!checkIsProvider){
            res.status(400).json({error: 'User is not a provider.'});
        }


        const { date } = req.query;

        const parseDate = parseISO(date);

        console.log(date);

        const schedulers = await Appointment.findAll({
            where: {
                provider_id: req.userId, 
                canceled_at:null,
                date: {
                    [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
                },       
            },
            order: ['date'],
            limit:20,
            offset: (page-1)*20,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name'],
                },
            ]
        });

        return res.json(schedulers);
    }

}

export default new ScheduleController();