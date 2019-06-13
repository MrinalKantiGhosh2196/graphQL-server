const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema
} = graphql;

const CompanyType = new GraphQLObjectType({
    name : "Company",
    fields : () => ({
        id : {type : GraphQLString},
        name : {type : GraphQLString},
        description : {type : GraphQLString},
        users : {
            type : new GraphQLList(UserType),
            resolve(parentType, args) {
                return axios.get(`https://usercompanyudemy.mrinalghosh.now.sh/companies/${parentType.id}/users`)
                    .then(resp => resp.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name : "User",
    fields : () => ({
        id : {type : GraphQLString},
        name : {type : GraphQLString},
        age :  {type : GraphQLInt},
        companyId : {
            type : CompanyType,
            resolve(parentValue, args) {
                return axios.get(`https://usercompanyudemy.mrinalghosh.now.sh/companies/${parentValue.companyId}`)
                    .then(resp => resp.data);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType(
    {
        name : "RootQueryType",
        fields : {
            user : {
                type : UserType,
                args : { id : { type : GraphQLString } },
                resolve(parentValue, args) {
                    return axios.get(`https://usercompanyudemy.mrinalghosh.now.sh/users/${args.id}`)
                        .then(resp => resp.data);
                }
            },
            company : {
                type : CompanyType,
                args : {id : {type : GraphQLString}},
                resolve(parentValue, args) {
                    return axios.get(`https://usercompanyudemy.mrinalghosh.now.sh/companies/${args.id}`)
                        .then(resp => resp.data);
                }
            }
        }
    }
);

const mutation = new GraphQLObjectType({
    name : "Mutation",
    fields : {
        addUser : {
            type : UserType,
            args : {
                id : {type : GraphQLString},
                name : {type : new GraphQLNonNull(GraphQLString)},
                age : {type : new GraphQLNonNull(GraphQLInt)},
                companyId : {type : GraphQLString}
            },
            resolve(parentValue, {id, name, age, companyId}){
                return axios.post('https://usercompanyudemy.mrinalghosh.now.sh/users', {id, name, age, companyId})
                    .then(resp => resp.data);
            }
        },
        deleteUser : {
            type : UserType,
            args : {
                id : {type : new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parentValue, {id}) {
                var userToBeDelete = await axios.get(`https://usercompanyudemy.mrinalghosh.now.sh/users/${id}`)
                    .then(res => res.data);
                console.log(userToBeDelete);
                return await axios.delete(`https://usercompanyudemy.mrinalghosh.now.sh/users/${id}`).then(()=>userToBeDelete);
            }
        },
        updateUser : {
            type : UserType,
            args : {
                id : {type : new GraphQLNonNull(GraphQLString)},
                name : {type : GraphQLString},
                age : {type : GraphQLInt},
                companyId : {type : GraphQLString}
            },
            resolve(parentValue, args) {
                return axios.patch(`https://usercompanyudemy.mrinalghosh.now.sh/users/${args.id}`, args)
                    .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query : RootQuery,
    mutation
});