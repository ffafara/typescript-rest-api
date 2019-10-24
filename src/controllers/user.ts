import * as bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import * as halson from 'halson'
import * as jwt from 'jsonwebtoken'
import { UserModel } from '../schemas/user'
import { Logger } from '../utility/logger'
import { formatOutput } from '../utility/orderApiUtility'

export let getUser = (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username

  Logger.logger.info(`[GET] [/users] ${username}`)

  UserModel.findOne({ username: username }, (err, user) => {
    if (!user) {
      Logger.logger.info(
        `[GET] [/users/:{username}] user with username ${username} not found`
      )
      return res.status(404).send()
    }

    user = user.toJSON()
    user._id = user._id.toString()
    user = halson(user).addLink('self', `/users/${user._id}`)
    return formatOutput(res, user, 200, 'user')
  })
}

export let addUser = (req: Request, res: Response, next: NextFunction) => {
  const newUser = new UserModel(req.body)

  Logger.logger.info(`[POST] [/users] ${newUser}`)
  newUser.password = bcrypt.hashSync(newUser.password, 10)

  newUser.save((err, user) => {
    if (err) {
      Logger.logger.info(
        `[POST] [/users] something went wrong when saving a new user ${newUser.username} | ${err.message}`
      )
      return res.status(500).send(err)
    }
    user = halson(user.toJSON()).addLink('self', `/users/${user._id}`)
    return formatOutput(res, user, 201, 'user')
  })
}

export let updateUser = (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username

  Logger.logger.info(`[PATCH] [/users] ${username}`)

  UserModel.findOne({ username: username }, (err, user) => {
    if (!user) {
      return res.status(404).send()
    }

    user.username = req.body.username || user.username
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.email = req.body.email || user.email
    user.password = req.body.password || user.password
    user.phone = req.body.phone || user.phone
    user.userStatus = req.body.userStatus || user.userStatus

    user.save(error => {
      res.status(204).send()
    })
  })
}

export let removeUser = (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username
  Logger.logger.warn(`[DELETE] [/users] ${username}`)
  UserModel.findOne({ username: username }, (err, user) => {
    if (!user) {
      Logger.logger.info(
        `[DELETE] [/users/:{username}] user with username ${username} not found`
      )
      return res.status(404).send()
    }

    user.remove(error => {
      res.status(204).send()
    })
  })
}

export let login = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username
  const password = req.body.password

  const user = await UserModel.findOne({ username: username })
  if (!user) {
    Logger.logger.info(
      `[POST] [/users/login] nouser found with the username ${username}`
    )
    return res.status(404).send()
  }

  const validate = bcrypt.compareSync(password, user.password.valueOf())
  if (validate) {
    const body = { _id: user._id, email: user.email }
    const token = jwt.sign({ user: body }, 'top_secret')

    return res.json({ token: token })
  } else {
    Logger.logger.info(`[GET] [/users/login] user not authorized ${username}`)
    return res.status(401).send()
  }
}
