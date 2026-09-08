import { app } from './app.js'
import { syncSchema } from './shared/db/orm.js'
import { config } from './config/environment.js'
import { seedDatabase } from './shared/db/seeder.js'

async function startServer() {
  try {
    await syncSchema()
    await seedDatabase()

    const port = config.port
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/ [Environment: ${config.env}]`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()
