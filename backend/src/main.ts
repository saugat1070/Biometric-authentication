import express from "express";
import { Request,Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import {
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse
} from "@simplewebauthn/server";

const app = express();
app.use(bodyParser.json());
app.use(cors())

const mongooseConnection = async()=>{
    await mongoose.connect("mongodb://localhost:27017/biometric").then(()=>{
        console.log("Database connected")
    }).catch((err : Error)=>{
        console.log(`Error at Database connection:${err?.message}`)
    })
}
mongooseConnection()

const users = new Map()

const rpName = 'E-Gov Demo';
const rpID = 'localhost';
const origin = `http://${rpID}:5173`;

app.post('/register/options', async(req:Request, res:Response) => {
  const { email } = req.body;
  const opts = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(email,"utf-16le"),
    userName: email,
  });
  users.set(email, { email, currentChallenge: opts?.challenge });
  res.json(opts);
});


app.post('/register/verify', async (req, res) => {
  const { email, attResp } = req.body;
  console.log(users)
  const expectedChallenge = users.get(email)?.currentChallenge;

  const verification = await verifyRegistrationResponse({
    response: attResp,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  console.log(verification)

  if (verification.verified) {
    users.get(email).credential = verification.registrationInfo?.credential;
  }

  res.json({ verified: verification.verified });
});

app.post('/login/options', async (req, res) => {
  const { email } = req.body;
  const user = users.get(email);
  if (!user?.credential) return res.status(400).json({ error: 'User not registered' });

  const opts = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [
      {
        id: Buffer.from(user.credential.credentialID,"base64url").toString(),
        transports:['internal']
      },
    ],
  });
  user.currentChallenge = opts.challenge;
  res.json(opts);
});

// 👉 Step 4: Login - Verify
app.post('/login/verify', async (req, res) => {
  const {email,authResp} = req.body
  const user = users.get(email);
  const expectedChallenge = user?.currentChallenge;

  const verification = await verifyAuthenticationResponse({
    response: authResp,
    expectedChallenge : expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: user.credential,
  });

  res.json({ verified: verification.verified });
  res.json({ verified: verification.verified });
});


export {app};