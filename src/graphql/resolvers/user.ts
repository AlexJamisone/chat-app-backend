import { CreateUsermaneResponse, GraphQLContext } from '../../util/types'

const resolver = {
	Query: {
		searchUsers: () => {},
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

				return { success: true}

				//Update user
			} catch (error: any) {
				console.log('Create Username Error', error)
				return {
					error: error?.message
				}
			}
		},
	},
}

export default resolver
