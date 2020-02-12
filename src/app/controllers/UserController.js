import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll();

    return res.json(users);
  }

  async show(req, res) {
    const { email } = req.params;

    const user = await User.findOne({ where: { email } });

    return res.json(user);
  }

  async store(req, res) {
    const { name, email, password, provider } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const user = await User.create({ name, email, password, provider });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
    });
  }

  async update(req, res) {
    const { email, oldPassword, password } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'O email informado já está em uso.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res
        .status(401)
        .json({ error: `A senha antiga informada está incorreta.` });
    }

    if (!oldPassword) {
      return res
        .status(401)
        .json({ error: `O campo senha antiga é obrigatório` });
    }

    if (!password) {
      return res
        .status(401)
        .json({ error: `O campo nova senha é obrigatório` });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
