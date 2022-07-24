import { createDatabase, dropDatabase } from 'typeorm-extension'

(async () => {
  console.log('Creating new database...', process.env.DB_NAME)

  await createDatabase({ ifNotExist: true, initialDatabase: 'hapi-boilerplate' })

  await dropDatabase({ ifExist: true })

  process.exit(0)
})()