const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const Redis = require('ioredis')

require("dotenv").config();

const publisher = new Redis(process.env.REDIS_URL)

const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID

function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}

async function init() {
    console.log('Executing script.js')
    publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString())
        publishLog(data.toString())
    })

    p.stderr.on('data', function (data) {
        console.error('Error', data.toString())
        publishLog(`error: ${data.toString()}`)
    })

    p.on('close', async function (code) {
        if (code !== 0) {
            console.error(`Build failed with exit code ${code}`)
            publishLog(`Build failed with exit code ${code}`)
            await publisher.quit()
            process.exit(1)
        }

        console.log('Build Complete')
        publishLog(`Build Complete`)
        
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        
        if (!fs.existsSync(distFolderPath)) {
            console.error('No dist folder found.')
            publishLog('Error: No dist folder found.')
            await publisher.quit()
            process.exit(1)
        }

        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

        publishLog(`Starting to upload`)
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath)
            publishLog(`uploading ${file}`)

            const s3Key = `__outputs/${PROJECT_ID}/${file.replace(/\\/g, '/')}`

            const command = new PutObjectCommand({
                Bucket: 'ricky-deploy-x',
                Key: s3Key,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) || 'application/octet-stream'
            })

            await s3Client.send(command)
            publishLog(`uploaded ${file}`)
            console.log('uploaded', filePath)
        }
        
        publishLog(`Done`)
        console.log('Done...')
        
        await publisher.quit()
        process.exit(0)
    })
}

init()