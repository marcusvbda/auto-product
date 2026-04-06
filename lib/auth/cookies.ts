import { NextResponse } from 'next/server'

export const AUTH_COOKIES = {
  ACCESS: 'auth_token',
  REFRESH: 'auth_refresh',
} as const

const IS_PROD = process.env.NODE_ENV === 'production'

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  response.cookies.set(AUTH_COOKIES.ACCESS, tokens.accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })
  response.cookies.set(AUTH_COOKIES.REFRESH, tokens.refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/api/auth/refresh',
  })
  return response
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_COOKIES.ACCESS, '', { httpOnly: true, maxAge: 0, path: '/' })
  response.cookies.set(AUTH_COOKIES.REFRESH, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/api/auth/refresh',
  })
  return response
}

export function setAccessCookie(response: NextResponse, accessToken: string) {
  response.cookies.set(AUTH_COOKIES.ACCESS, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })
  return response
}
