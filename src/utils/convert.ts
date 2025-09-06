
export const convert = (string: any) => {
    const [
        header,
        motd,
        protocol,
        version,
        playersOnline,
        playersMax,
        serverId,
        levelName,
        gamemode,
        gamemodeId,
        portV4,
        portV6
    ] = string.split(';');
    return {
        header,
        motd,
        protocol,
        version,
        playersOnline,
        playersMax,
        serverId,
        levelName,
        gamemode,
        gamemodeId,
        portV4,
        portV6
    };
};