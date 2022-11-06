import { ISODateString } from 'next-auth'
import { PubSub } from 'graphql-subscriptions'
import { Prisma, PrismaClient } from '@prisma/client'
import {
	conversationPopulated,
	participantsPopulated,
} from '../graphql/resolvers/conversation'
import { Context } from 'graphql-ws/lib/server'
//Server cobfiguration
export interface GraphQLContext {
	session: Session | null
	prisma: PrismaClient
	pubsub: PubSub;
}

export interface Session {
	user: User
	expires: ISODateString
}

export interface SubscriptionContext extends Context {
	connectionParams: {
		 session?: Session
	}
}

//User

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

//Conversation

export type ConversationPopulated = Prisma.ConversationGetPayload<{
	include: typeof conversationPopulated
}>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
	include: typeof participantsPopulated
}>
