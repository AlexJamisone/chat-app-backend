const resolver = {
    Query: {
        searchUsers: () => {}
    },
    Mutation: {
        createUsername: (_: any, args: {username: string}, context: any) => {
            const {username} = args
            console.log('Create User', username);
            console.log('There is Context', context);
        }
    },
}

export default resolver