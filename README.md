![Eat The Pie](https://github.com/eatthepie/docs/blob/main/static/img/header.png)

# Eat The Pie CLI

A command-line interface for interacting with Eat The Pie, the world lottery on Ethereum.

## 🚀 Quick Start

```bash
# Install globally
npm install -g eatthepie

# Or run directly with npx
npx eatthepie
```

## Commands

### Setup & Configuration

- `setup` - Initial setup
- `config` - View configuration

### Game Actions

- `buy` - Purchase a lottery ticket
- `status` - Get current game status
- `game-info` - Get detailed game information
- `did-i-win` - Check if you won
- `ticket-history` - Get ticket purchase history

### Prize & NFT Management

- `claim-prize` - Claim winnings
- `mint-nft` - Mint NFT for jackpot winner

### Draw & Verification

- `initiate-draw` - Initiate draw for the current game
- `set-randao` - Set RANDAO value for the game
- `submit-vdf-proof` - Submit current game's VDF proof
- `verify-vdf` - Verify a previous game's VDF proof
- `calculate-payouts` - Calculate prize distribution

### Difficulty Management

- `difficulty-info` - View current difficulty settings
- `change-difficulty` - Change difficulty parameters

## Development

```bash
# Clone the repository
git clone https://github.com/eatthepie/cli
cd cli

# Install dependencies
npm install

# Run a command
npm run start [command]
```

## License

MIT
