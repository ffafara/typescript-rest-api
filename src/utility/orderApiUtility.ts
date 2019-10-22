import { Response } from 'express'
import { ApplicationType } from '../models/applicationType'

export let formatOutput = (
  res: Response,
  data: any,
  statusCode: number,
  applicationType: ApplicationType
) => {
  return res.format({
    json: () => {
      res.type(applicationType)
      res.status(statusCode).send(data)
    },
    // tslint:disable-next-line: object-literal-sort-keys
    default: () => {
      res.status(406).send()
    },
  })
}
