import type { Request, Response } from "express";
import * as auth from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const result = await auth.register(req.body);
  res.status(201).json(result);
}

export async function verifyOtp(req: Request, res: Response) {
  const result = await auth.verifyOtp(req.body.email, req.body.otp);
  res.json(result);
}

export async function login(req: Request, res: Response) {
  const result = await auth.login({
    email: req.body.email,
    password: req.body.password,
    ua: req.headers["user-agent"] ?? undefined,
    ip: req.ip,
  });
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const result = await auth.refresh(req.body.refreshToken, req.headers["user-agent"] ?? undefined, req.ip);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  const result = await auth.logout(req.body.refreshToken);
  res.json(result);
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await auth.forgotPassword(req.body.email);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response) {
  const result = await auth.resetPassword(req.body.token, req.body.password);
  res.json(result);
}

export async function googleLogin(req: Request, res: Response) {
  const result = await auth.loginWithGoogle({
    idToken: req.body.idToken,
    ua: req.headers["user-agent"] ?? undefined,
    ip: req.ip,
  });
  res.json(result);
}
