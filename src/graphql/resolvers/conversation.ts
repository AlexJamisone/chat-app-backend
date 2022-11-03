import { Prisma } from '@prisma/client'
import { ApolloError } from 'apollo-server-core'
import { ConversationPopulated, GraphQLContext } from '../../util/types'
const resolvers = {
	Query: {
		conversations: async (
			_: any,
			__: any,
			context: GraphQLContext
		): Promise<Array<ConversationPopulated>> => {
			const { session, prisma } = context
			if (!session?.user) {
				throw new ApolloError(`Not Authorized`)
			}
			const {
				user: { id: userId },
			} = session
			try {
				const conversations = await prisma.conversation.findMany({
					include: conversationPopulated,
				})
				return conversations.filter(
					(conversation) =>
						!!conversation.participants.find(
							(p) => p.userId === userId
						)
				)
			} catch (error: any) {
				console.log(`conversation`, error)
				throw new ApolloError(error?.message)
			}
		},
	},
	Mutation: {
		createConversation: async (
			_: any,
			args: { participantIds: Array<string> },
			context: GraphQLContext
		): Promise<{ conversationId: string }> => {
			const { participantIds } = args
			const { session, prisma } = context
			if (!session?.user) {
				throw new ApolloError('Not Authorize')
			}
			const {
				user: { id: userId },
			} = session
			try {
				const conversation = await prisma.conversation.create({
					data: {
						participants: {
							createMany: {
								data: participantIds.map((id) => ({
									userId: id,
									hasSeenLatestMessage: id === userId,
								})),
							},
						},
					},
					include: conversationPopulated,
				})
				return {
					conversationId: conversation.id,
				}
			} catch (error) {
				console.log(`CreateConversation Error`, error)
				throw new ApolloError('Error creating conversation')
			}
		},
	},
}
export const participantsPopulated =
	Prisma.validator<Prisma.ConversationParticipantInclude>()({
		user: {
			select: {
				id: true,
				username: true,
			},
		},
	})

export const conversationPopulated =
	Prisma.validator<Prisma.ConversationInclude>()({
		participants: {
			include: participantsPopulated,
		},
		latestMessage: {
			include: {
				sender: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		},
	})

export default resolvers
