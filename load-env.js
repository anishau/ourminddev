const fs = require('fs')
const path = require('path')

// Read .env file
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse .env content
const env = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=')
    if (key && value) {
        acc[key.trim()] = value.trim()
    }
    return acc
}, {})

// Export the parsed environment variables
module.exports = env 