import { fetchClanData, fetchPlayerData, populateCardDictionary, cardDictionary, fetchClanWarlogData } from './clashapi.js'
import { updatePlayer, bulkUpdatePlayers, updateCurrentDeck, bulkUpdateCurrentDecks, updatePlayerCards, updateClan, updateClanPlayers, updateClanWars, updateClanWarPlayers, getInitPlayerCache, getInitClanCache } from './query.js'
import moment from 'moment'
import _ from 'lodash'


export const Client = ({ playerCache, clanCache }) => {
  return {
    initCache: () => {_initCache(playerCache, clanCache)},
    savePlayer: (tag='#PLQLR82YQ') => {_savePlayer(tag, playerCache)},
    saveDeck: (tag='#PLQLR82YQ') => {_saveDeck(tag, playerCache)},
    savePlayerCards: (tag='#PLQLR82YQ') => {_savePlayerCards(tag, playerCache)},
    savePlayerData: (tags=['#PLQLR82YQ']) => {_savePlayerData(tags, playerCache)},
    saveClanData: (tag='#9VUPUQJP') => {return _saveClanData(tag, clanCache, playerCache)},
    saveWarlogData: (tag='#9VUPUQJP') => {return _saveWarlogData(tag, clanCache, playerCache)}
  }
}

const _initCache = async (playerCache, clanCache) => {
  let playerCacheData = await getInitPlayerCache()
  playerCache.mset(playerCacheData.map(row => row.dataValues)
    .map(row => {
      //ttl is 1 hour minus the difference between 'now' and last update
      let ttl = 3600 - moment().diff(moment(row.updatedAt), 'seconds')
      return {
        key: row.tag,
        val: true,
        ttl: ttl
      }
    })
  )

  let clanCacheData = await getInitClanCache()
  clanCache.mset(clanCacheData.map(row => row.dataValues)
    .map(row => {
      //ttl is 1 day minus the difference between 'now' and last update
      let ttl = 86400 - moment().diff(moment(row.updatedAt), 'seconds')
      return {
        key: row.tag,
        val: true,
        ttl: ttl
      }
    })
  )
}

const _savePlayer = async (tag, playerCache) => {
  if (!playerCache.get(tag) && tag != undefined) {
    const data = await fetchPlayerData(tag);
    updatePlayer(data)
    playerCache.set(tag, true)
  } else {
    return true
  }
}

const _saveDeck = async (tag, playerCache) => {
  if (!playerCache.get(tag) && tag != undefined) {
    const data = await fetchPlayerData(tag);
    updateCurrentDeck(data)
    playerCache.set(tag, true)
  } else {
    return true
  }
}

const _buildPlayerCards = ( { tag, cards } ) => {
  return cards.map(card => {
    return {
      tag: tag,
      cardId: card.id,
      cardLevel: card.level + 13 - card.maxLevel,
      cardCount: card.count
    }
  })
}

const _buildBulkPlayerCards = (players) => {
  const allPlayerCards = players.map(player => {
    return _buildPlayerCards(player)
  })
  
  return _.flatten(allPlayerCards)
}

const _savePlayerCards = async (tag='#PLQLR82YQ', playerCache) => {
  if (!playerCache.get(tag) && tag != undefined) {
    const data = await fetchPlayerData(tag);
    const playerCards = _buildPlayerCards(data.tag, data.cards)
    
    updatePlayerCards(playerCards)
    
    playerCache.set(tag, true)
  } else {
    return true
  }
}

const _buildDeck = ( { tag, currentDeck }) => {
  const deck = {playerTag: tag}
  currentDeck.forEach((card, i) => {
    deck[`card${i+1}Id`] = card.id
  })

  return deck
}

const _buildBulkDecks = (players) => {
  return players.map(player => {
    return _buildDeck(player)
  })
}

const _buildPlayer = (data) => {
  const keysICareAbout = ["tag", "name", "expLevel", "trophies", "bestTrophies", "wins", "losses", "battleCount", "threeCrownWins", "challengeCardsWon", "challengeMaxWins", "tournamentBattleCount", "role", "donations", "donationsReceived", "totalDonations", "warDayWins", "clanCardsCollected"]
  const props = Object.entries(data).filter( e => keysICareAbout.includes(e[0]) )
  const player = Object.fromEntries(props)

  player.clanTag = data.clan.tag

  return player
}

const _buildBulkPlayers = (players) => {
  const allPlayers = players.map(player => {
    return _buildPlayer(player)
  })
  
  return _.flatten(allPlayers)
}

const _savePlayerData = async (tags=['#PLQLR82YQ'], playerCache) => {
  const newTags = tags.filter(tag => !playerCache.has(tag))

  if (newTags.length === 1) {
    const data = await fetchPlayerData(newTags[0])
    const playerCards = _buildPlayerCards(data)

    const deck = _buildDeck(data)

    updatePlayer(data)
    updateCurrentDeck(deck)
    updatePlayerCards(playerCards)

    playerCache.set(data.tag, true)

  } else if (newTags.length > 1) {
    const playersData = newTags.map(tag => {
      return fetchPlayerData(tag)
    })

    Promise.all(playersData)
      .then(players => {
        const bulkDecks = _buildBulkDecks(players)
        bulkUpdateCurrentDecks(bulkDecks)
      
        const bulkPlayers = _buildBulkPlayers(players)
        bulkUpdatePlayers(bulkPlayers)

        const bulkPlayerCards = _buildBulkPlayerCards(players)
        updatePlayerCards(bulkPlayerCards)
      })

     playerCache.mset(newTags.map(tag => {return {key: tag, val: true}}))
  } else {
    return true
  }
}

const _buildClan = (data) => {
  const keysICareAbout = ["tag", "name", "type", "description", "badgeId", "clanScore", "clanWarTrophies", "requiredTrophies", "donationsPerWeek", "members"]
  const props = Object.entries(data).filter( e => keysICareAbout.includes(e[0]) )
  const clan = Object.fromEntries(props)

  clan.locationId = data.location.id
  clan.locationName = data.location.name
  clan.locationIsCountry = data.location.isCountry
  clan.locationCountryCode = data.location.countryCode

  return clan
}


const _buildClanPlayersArray = (clantag, players) => {
  return players.map(player => {
    player.clanTag = clantag
    player.playerTag = player.tag
    player.lastSeen = moment.utc(player.lastSeen).format()

    return player
  })
}

const _saveClanData = async (tag='#9VUPUQJP', clanCache, playerCache) => {
  if (!clanCache.get(tag) && tag != undefined) {
    const data = await fetchClanData(tag)

    const clan = _buildClan(data)
    const clanPlayers = _buildClanPlayersArray(data.tag, data.memberList)
    const playerTags = data.memberList.map(member => member.tag)

    updateClan(clan)
    updateClanPlayers(clanPlayers)

    clanCache.set(tag, true)

    return playerTags  
  } else {
    return true
  }
}

const _buildWarlogRecords = (clanTag, data) => {
  let warPlayerRecords = []
  const allOpponents = new Set()
  
  const clanWarRecords = data.map(war => {
    const warRecord =   {
      tag: clanTag,
      seasonId: war.seasonId,
      createdDate: moment.utc(war.createdDate).format()
    }
    const clans = []

    war.standings.forEach(({ clan }, ind) => {
      clans.push(clan.tag)
      if (clan.tag === clanTag) {
        warRecord.clanScore = clan.clanScore
        warRecord.participants = clan.participants
        warRecord.battlesPlayed = clan.battlesPlayed
        warRecord.wins = clan.wins
        warRecord.crowns = clan.crowns
        warRecord.standing = ind + 1
      }
    })

    clans.forEach(clan => {
      allOpponents.add(clan)
    })
    warRecord.warId = clans.sort().join('.')

    warPlayerRecords = warPlayerRecords.concat(_buildWarPlayersRecords(warRecord.warId, clanTag, war.participants))

    return warRecord
  })
  
  allOpponents.delete(clanTag)

  return {
    clanWarRecords: clanWarRecords,
    warPlayerRecords: warPlayerRecords,
    allOpponents: [...allOpponents],
    allPlayers: warPlayerRecords.map(record => record.playerTag)
  }
}

const _saveWarlogData = async (tag='#9VUPUQJP', clanCache, playerCache, force=false) => {
  if ((!clanCache.get(tag) && tag != undefined) || force) {
    const data = await fetchClanWarlogData(tag)
    const { clanWarRecords, warPlayerRecords, allOpponents, allPlayers } = _buildWarlogRecords(tag, data.items)

    updateClanWars(clanWarRecords)
    updateClanWarPlayers(warPlayerRecords)
    
    clanCache.set(tag, true)

    return { allOpponents, allPlayers }
  } else {
    return true
  }
}

const _saveClans = (clans, clanCache, playerCache) => {
  clans.forEach(clan => {
    // _saveClanData(clan, clanCache, playerCache)
    _saveWarlogData(clan, clanCache, playerCache, true)
  })
}

const _buildWarPlayersRecords = (warId, clanTag, participants) => {
  return participants.map(participant => {
    return {
      warId: warId,
      clanTag: clanTag,
      playerTag: participant.tag,
      name: participant.name,
      cardsEarned: participant.cardsEarned,
      battlesPlayed: participant.battlesPlayed,
      wins: participant.wins,
      collectionDayBattlesPlayed: participant.collectionDayBattlesPlayed,
      numberOfBattles: participant.numberOfBattles
    }
  })
}