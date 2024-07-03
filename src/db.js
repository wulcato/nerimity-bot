import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export const getGlobalLeaderBoard = () => {
    return prisma.user.findMany({
        take: 10,
        orderBy: {
            totalXp: 'desc'
        },
    });
}
export const getServerLeaderBoard = (serverId) => {
    return prisma.server.findMany({
        take: 10,
        where: {
            id: serverId,
        },
        include: {user: {select: {username: true}}},
        orderBy: {
            totalXp: 'desc'
        },
    });
}

export const getServer = async (serverId, userId) => {
    return prisma.server.findUnique({
        where: {
            id_userId: {
                userId,
                id: serverId
            }
        }
    })
}

export const getUser = async (userId) => {
    return prisma.user.findUnique({
        where: {
            id: userId
        }
    });
}

/**
 * Updates a user's information.
 *
 * @param {Object} data - The user data to update.
 * @param {number} data.level - The new level of the user.
 * @param {number} data.xp - The new XP of the user.
 * @param {string} data.username - The new username of the user.
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
export const updateUser = async (userId, data) => {
    const user = await prisma.user.update({
        where: {id: userId},
        data
    })
    return user;
}

export const createUser = async (userId, username) => {

    const user = await prisma.user.create({
        data: {
            id: userId,
            username,
        }
    })
    return user;
}
export const createServer = async (userId, serverId) => {

    const user = await prisma.server.create({
        data: {
            id: serverId,
            userId
        }
    })
    return user;
}

export const addXp = async (userId, serverId, username) => {
    let user = await prisma.user.findUnique({
        where: {id: userId},
        select: {xp: true, level: true}
    })

    let server  = await getServer(serverId, userId);

    if (!user) {
        user = await createUser(userId, username);
    }
    if (!server) {
        server = await createServer(userId, serverId);
    }

    
    let globalBonusXp = 0;
    const globalRequiredXp = calculateRequiredXp(user.level);
    const globalXPToAdd = globalBonusXp + 10
    const globalXP = user.xp + globalXPToAdd;
    let newGlobalXp = globalXP;
    let newGlobalLevel = user.level;

    if (globalXP > globalRequiredXp) {
        newGlobalXp = newGlobalXp - globalRequiredXp;
        newGlobalLevel++;
    }

    let serverBonusXp = 0;
    const serverRequiredXp = calculateRequiredXp(server.level);
    const serverXPToAdd = serverBonusXp + 10
    const serverXP = server.xp + serverXPToAdd;
    let newServerXp = serverXP;
    let newServerLevel = server.level;

    if (serverXP > serverRequiredXp) {
        newServerXp = newServerXp - serverRequiredXp;
        newServerLevel++;
    }

    await prisma.user.update({
        where: {id: userId},
        data: {
            xp: newGlobalXp, 
            level: newGlobalLevel, 
            totalXp: {increment: globalXPToAdd},
            // lastStreakAt: Date.now(),
            servers: {
                update: {
                    where: {id_userId: {id: serverId, userId}},
                    data: {
                        xp: newServerXp, 
                        level: newServerLevel,
                        totalXp: {increment: serverXPToAdd}
                        // lastStreakAt: Date.now()
                    }
                }
            }
        }
    })
    return {
        globalLevelUp: newGlobalLevel > user.level,
        globalXp: newGlobalXp, 
        globalLevel: newGlobalLevel,

        serverLevelUp: newServerLevel > server.level,
        serverXp: newServerXp, 
        serverLevel: newServerLevel
    };    
}


export const calculateRequiredXp = (currentLevel) => 5 * ((currentLevel + 1) ** 2) + 50 * (currentLevel + 1) + 100;
