const { sequelize } = require('./db.js');
const Sequelize = require('Sequelize');


const Player = sequelize.define('player', {
  // attributes
  tag: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING
  },
  expLevel: {
    type: Sequelize.INTEGER
  },
  trophies: {
    type: Sequelize.INTEGER
  },
  bestTrophies: {
    type: Sequelize.INTEGER
  },
  wins: {
    type: Sequelize.INTEGER
  },
  losses: {
    type: Sequelize.INTEGER
  },
  battleCount: {
    type: Sequelize.INTEGER
  },
  threeCrownWins: {
    type: Sequelize.INTEGER
  },
  challengeCardsWon: {
    type: Sequelize.INTEGER
  },
  challengeMaxWins: {
    type: Sequelize.INTEGER
  },
  tournamentBattleCount: {
    type: Sequelize.INTEGER
  },
  role: {
    type: Sequelize.STRING
  },
  donations: {
    type: Sequelize.INTEGER
  },
  donationsReceived: {
    type: Sequelize.INTEGER
  },
  totalDonations: {
    type: Sequelize.INTEGER
  },
  warDayWins: {
    type: Sequelize.INTEGER
  },
  clanCardsCollected: {
    type: Sequelize.INTEGER
  },
  clanTag: {
    type: Sequelize.STRING
  }
}, {
  // options
});

const Current_Deck = sequelize.define('current_deck', {
  // attributes
  playerTag: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  card1Id: {
    type: Sequelize.INTEGER
  },
  card2Id: {
    type: Sequelize.INTEGER
  },
  card3Id: {
    type: Sequelize.INTEGER
  },
  card4Id: {
    type: Sequelize.INTEGER
  },
  card5Id: {
    type: Sequelize.INTEGER
  },
  card6Id: {
    type: Sequelize.INTEGER
  },
  card7Id: {
    type: Sequelize.INTEGER
  },
  card8Id: {
    type: Sequelize.INTEGER
  }
}, {
  // options
});

const Player_Card = sequelize.define('player_card', {
  // attributes
  tag: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  cardId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  cardLevel: {
    type: Sequelize.STRING
  },
  cardCount: {
    type: Sequelize.STRING
  }
}, {
  // options
});

const Clan = sequelize.define('clan', {
  // attributes
  tag: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  badgeId: {
    type: Sequelize.INTEGER
  },
  clanScore: {
    type: Sequelize.INTEGER
  },
  clanWarTrophies: {
    type: Sequelize.INTEGER
  },
  locationId: {
    type: Sequelize.INTEGER
  },
  locationName: {
    type: Sequelize.STRING
  },
  locationIsCountry: {
    type: Sequelize.BOOLEAN
  },
  locationCountryCode: {
    type: Sequelize.STRING
  },
  requiredTrophies: {
    type: Sequelize.INTEGER
  },
  donationsPerWeek: {
    type: Sequelize.STRING
  },
  members: {
    type: Sequelize.INTEGER
  }
}, {
  // options
});

const Clan_Player = sequelize.define('clan_player', {
  // attributes
  clanTag: {
    type: Sequelize.STRING
  },
  playerTag: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.STRING
  },
  lastSeen: {
    type: Sequelize.DATE
  },
  expLevel: {
    type: Sequelize.INTEGER
  },
  trophies: {
    type: Sequelize.INTEGER
  },
  clanRank: {
    type: Sequelize.INTEGER
  },
  previousClanRank: {
    type: Sequelize.INTEGER
  },
  donations: {
    type: Sequelize.INTEGER
  },
  donationsReceived: {
    type: Sequelize.INTEGER
  }
}, {
  // options
});

module.exports = { Player, Current_Deck, Player_Card, Clan, Clan_Player }