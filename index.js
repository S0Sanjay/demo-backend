const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
require("dotenv").config()

const app = express()

// FIX 1: corsOptions defined BEFORE it is used
var corsOptions = {
  origin: ["https://bulkmail-frontend-eosin.vercel.app"]  // FIX 3: no trailing slash
}

app.use(cors(corsOptions))

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bulkmail-frontend-eosin.vercel.app")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://bulkmail-frontend-eosin.vercel.app')  // FIX 2: no \n
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.send()
})

app.use(express.json())

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const emailTemplate = (message, recipient) => ({
  from: process.env.EMAIL_USER,
  to: recipient,
  subject: 'You get Text Message from Your App!',
  text: message
})

const sendMails = ({ message, emailList }) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const recipient of emailList) {
        const mailOptions = emailTemplate(message, recipient)
        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${recipient}`)
      }
      resolve("Success")
    } catch (error) {
      console.error('Error sending emails:', error.message)
      reject(error.message)
    }
  })
}

app.get("/", function (req, res) {
  res.send("BulkMail Backend is Running!")
})

app.post("/sendemail", function (req, res) {
  sendMails(req.body)
    .then(function (response) {
      console.log(response)
      res.send(true)
    })
    .catch(function (error) {
      res.send(false)
    })
})

module.exports = app