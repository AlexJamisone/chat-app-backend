import { ISODateString } from 'next-auth'
import { PrismaClient } from '@prisma/client'
export interface GraphQLContext {
	session: Session | null
	prisma: PrismaClient
	// pubsub
}

//User

export interface Session {
	user: User
	expires: ISODateString
}

export interface User {
	id: string
	emailVerified: boolean
	username: string
	email: string
	name: string
	image: string
}

export interface CreateUsermaneResponse {
	success?: boolean
	error?: string
}
