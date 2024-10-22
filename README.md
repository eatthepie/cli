![Eat The Pie](https://github.com/eatthepie/docs/blob/main/static/img/header.png)

# EatThePie CLI

A command-line interface for playing and managing Eat The Pie lottery on Ethereum.

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
- `status` - Check current game status
- `game-info` - View detailed game information
- `did-i-win` - Check if you won
- `ticket-history` - View ticket purchase history

### Prize & NFT Management

- `claim-prize` - Claim winnings
- `mint-nft` - Minting NFTs for jackpot winners

### Draw & Verification

- `initiate-draw` - Initiate drawing for the current game
- `set-randao` - Set RANDAO value for the game
- `submit-vdf-proof` - Submit VDF proof
- `verify-vdf` - Verify VDF proof
- `calculate-payouts` - Calculate prize distribution

### Difficulty Management

- `difficulty-info` - View current difficulty settings
- `change-difficulty` - Modify difficulty parameters

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/eatthepie-cli

# Install dependencies
npm install

# Run locally
npm start
```

## License

MIT
