import * as Yup from 'yup';

import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/notifications';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro na validação dos dados' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Você só pode criar agendamentos com um prestador de serviço',
      });
    }

    /**
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error:
          'Não é possível criar agendamentos em datas ou horários passados',
      });
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvailability) {
      return res.status(400).json({
        error: 'Essa data não está disponível para agendamentos',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify appointment provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async destroy(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Você não tem permissão para cancelar esse agendamento',
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Você só pode cancelar agendamentos com 2 horas de antecedência',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
