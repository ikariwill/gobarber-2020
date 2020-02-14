import User from '../models/User';
import Notification from '../schemas/notifications';

class NotificationController {
  async index(req, res) {
    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Apenas prestadores de serviço podem carregar as notificações',
      });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort('-createdAt')
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notifications = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      { new: true }
    );

    return res.json(notifications);
  }
}

export default new NotificationController();
