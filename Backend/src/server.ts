import 'dotenv/config'
import { app } from './app.js'
import { syncSchema } from './shared/db/orm.js'
import { seedDatabase } from './shared/db/seeder.js'

async function startServer() {
  try {
    await syncSchema()
    await seedDatabase()

    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()
