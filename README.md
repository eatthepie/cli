![Eat The Pie](https://github.com/eatthepie/docs/blob/main/static/img/header.png)

# Eat The Pie CLI

A command-line interface for interacting with Eat The Pie, the world lottery on Ethereum.

## ⚠️ Disclaimer

Eat The Pie is an autonomous, decentralized lottery on Ethereum. An Ethereum private key with sufficient funds is required to purchase tickets. Participate at your own risk. For complete information about the protocol, please visit [docs.eatthepie.xyz](https://docs.eatthepie.xyz).

## 🚀 Quick Start

### Prerequisites

- Node.js and npm installed
- An Ethereum private key with ETH for transactions

### Installation

```bash
# Install once globally
npm install -g eatthepie

# Then use anywhere with:
eatthepie [command]
```

## 📝 Deployed Contracts

| Network     | Address                                      |
| ----------- | -------------------------------------------- |
| Mainnet     | `0x043c9ae2764B5a7c2d685bc0262F8cF2f6D86008` |
| World Chain | `0x44b340051a31d216f83428b447dba2c102dff373` |
| Sepolia     | `0x44B340051a31D216f83428B447DBa2C102DFF373` |

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
