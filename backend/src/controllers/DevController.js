const axios = require('axios')
const Dev = require('../models/Dev')

module.exports = {

    async index(req, res) {
        const { user } = req.headers

        const loggedDev = await Dev.findById(user)

        const users = await Dev.find({
            // $and: Todas as condições precisam ser atendidas
            $and: [
                // Todos os usuários que _id seja NOT EQUAL ($ne) ao usuário logado (user)
                { _id: { $ne: user } },

                // Todos os usuários que _id NOT IN ($nin) loggedDev.likes
                // ou seja
                // Todos os usuários que o usuário logado não deu like
                { _id: { $nin: loggedDev.likes } },

                // Todos os usuários que _id NOT IN ($nin) loggedDev.dislikes
                // ou seja
                // Todos os usuários que o usuário logado não deu dislike
                { _id: { $nin: loggedDev.dislikes } },
            ],
        })

        return res.json(users)
    },

    async store(req, res) {
        const { username } = req.body

        const userExists = await Dev.findOne({ user: username })

        if (userExists) {
            return res.json(userExists)
        }

        const response = await axios.get(`https://api.github.com/users/${username}`)

        const { name, bio, avatar_url: avatar } = response.data

        const dev = await Dev.create({
            name,
            user: username,
            bio,
            avatar
        })

        return res.json(dev)
    }

}