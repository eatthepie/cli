# EatThePie CLI

EatThePie CLI is a command-line interface application for interacting with the EatThePie Ethereum-based lottery smart contract. This tool allows users to set up their configuration, view current game information, and purchase lottery tickets.

## Features

- Interactive setup for configuring network and wallet details
- View current game information, including prize pool and time until next draw
- Purchase lottery tickets with manual number selection or auto-generation
- Support for multiple Ethereum networks (mainnet, Sepolia testnet, and local Anvil chain)

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- An Ethereum wallet with a private key
- Access to an Ethereum node (e.g., via Infura)

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/eatthepie-cli.git
   cd eatthepie-cli
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. (Optional) Make the CLI globally accessible:
   ```
   npm link
   ```

## Usage

### Setup

Before using the CLI, you need to set up your configuration:

```
node src/index.js setup
```

or if you've made it globally accessible:

```
eatthepie setup
```

Follow the prompts to enter your network preferences, contract address, RPC URL, and wallet private key.

### View Current Game Information

To view information about the current game:

```
node src/index.js info
```

or

```
eatthepie info
```

### Buy Lottery Tickets

To purchase lottery tickets:

```
node src/index.js buy
```

or

```
eatthepie buy
```

Follow the prompts to specify the number of tickets and choose between manual number entry or auto-generation.

## Configuration

Your configuration is stored in a `config.json` file in the project root. This file contains sensitive information (like your private key), so make sure to keep it secure and never commit it to version control.

## Security Considerations

- Never share your private key or commit it to version control.
- Use a dedicated wallet for interacting with this contract, separate from your main funds.
- Always verify transaction details before confirming.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application interacts with real cryptocurrency transactions. Use at your own risk. Always verify the smart contract you're interacting with and understand the risks involved in blockchain transactions.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
