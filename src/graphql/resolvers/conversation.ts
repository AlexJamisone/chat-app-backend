import { Prisma } from '@prisma/client'
import { ApolloError } from 'apollo-server-core'
import { GraphQLContext } from '../../util/types'
const resolvers = {
	Mutation: {
		createConversation: async (
			_: any,
			args: { participantsIds: Array<string> },
			context: GraphQLContext
		) => {
			const { participantsIds } = args
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
								data: participantsIds.map((id) => ({
									userId: id,
									hasSeenLatestMessage: id === userId,
								})),
							},
						},
					},
					include: conversationPopulated,
				})
			} catch (error) {
				console.log(`CreateConversation Error`, error)
				throw new ApolloError('Error creating conversation')
			}
		},
	},
}
export const participantsPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
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
			include: participantsPopulated
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
