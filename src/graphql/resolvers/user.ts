import { User } from '@prisma/client'
import { ApolloError } from 'apollo-server-core'
import { CreateUsermaneResponse, GraphQLContext } from '../../util/types'

const resolver = {
	Query: {
		searchUsers: async (
			_: any,
			args: { username: string },
			context: GraphQLContext
		): Promise<Array<User>> => {
			const { username: searchedUsername } = args
			const { session, prisma } = context

			if (!session) {
				throw new ApolloError('Not Authorized')
			}

			const {
				user: { username: myUsername },
			} = session

			try {
				const users = await prisma.user.findMany({
					where: {
						username: {
							contains: searchedUsername,
							not: myUsername,
							mode: 'insensitive'
						}
					}
				})
				return users
			} catch (error: any) {
				console.log('Search User Error', error);
				throw new ApolloError(error?.message)
			}
		},
	},
	Mutation: {
		createUsername: async (
			_: any,
			args: { username: string },
			context: GraphQLContext
		): Promise<CreateUsermaneResponse> => {
			const { username } = args
			const { session, prisma } = context

			if (!session?.user) {
				return {
					error: 'Not Autharized',
				}
			}

			const { id: userId } = session.user

			try {
				//Check user name is not Taken
				const existingUser = await prisma.user.findUnique({
					where: {
						username,
					},
				})

				if (existingUser) {
					return {
						error: 'Username already taken. Try another',
					}
				}

				await prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						username,
					},
				})

				return { success: true }

				//Update user
			} catch (error: any) {
				console.log('Create Username Error', error)
				return {
					error: error?.message,
				}
			}
		},
	},
}

export default resolver
