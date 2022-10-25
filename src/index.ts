// npm install apollo-server-express apollo-server-core express graphql
import { ApolloServer } from 'apollo-server-express'
import {
	ApolloServerPluginDrainHttpServer,
	ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core'
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import http from 'http'
import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers'
import { getSession } from 'next-auth/react'
import * as dotenv from 'dotenv'
import { GraphQLContext, Session } from './util/types'
import { PrismaClient } from '@prisma/client'

async function main() {
	dotenv.config()
	const app = express()
	const httpServer = http.createServer(app)
	const schema = makeExecutableSchema({
		typeDefs,
		resolvers,
	})
	const coresOptions = {
		origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	}

	// Context parametrs
	const prisma = new PrismaClient()
	

	const server = new ApolloServer({
		schema,
		csrfPrevention: true,
		context: async ({ req, res }): Promise<GraphQLContext> => {
			const session = await getSession({ req }) as Session
			return { session, prisma }
		},
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			ApolloServerPluginLandingPageLocalDefault({ embed: true }),
		],
	})
	await server.start()
	server.applyMiddleware({ app, cors: coresOptions })
	await new Promise<void>((resolve) =>
		httpServer.listen({ port: 4000 }, resolve)
	)
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

main().catch((err) => console.log(err))
