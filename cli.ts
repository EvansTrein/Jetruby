import { Command } from 'commander';
import axios, { AxiosError } from 'axios';

const program = new Command();

// Base URL of the NestJS application
const BASE_URL = 'http://localhost:8080/api';

// Object containing all available commands
const commands = {
  'get-repo': async (key?: string) => {
    if (!key) {
      console.error('Error: Key is required for "get-repo" command.');
      return;
    }
    const response = await axios.get(`${BASE_URL}/repo/${key}`);
    console.log('Repository:', response.data);
  },
  'get-all-repos': async () => {
    const response = await axios.get(`${BASE_URL}/repo`);
    console.log('All repositories:', response.data);
  },
  'reset-timer': async () => {
    await axios.post(`${BASE_URL}/reset`);
    console.log('Timer successfully reset');
  },
};

// Function to handle commands
async function handleCommand(command: string, key?: string) {
  try {
    // Check if the command exists in the commands object
    if (command in commands) {
      await commands[command as keyof typeof commands](key);
    } else {
      console.error(
        'Error: Unknown command. Available commands are:',
        Object.keys(commands).join(', ')
      );
    }
  } catch (error: unknown) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNREFUSED') {
        console.error('Error: The server is not running or unavailable.');
      } else if (axiosError.response) {
        // Server responded with a status code outside the range of 2xx
        console.error(
          `Error: Server responded with status ${axiosError.response.status}: ${axiosError.response.statusText}`
        );
      } else {
        // Other Axios errors (e.g., network issues)
        console.error(`Error: ${axiosError.message}`);
      }
    } else {
      // Non-Axios errors
      console.error(`Error: ${(error as Error).message}`);
    }
  }
}

// Main command handler
program
  .arguments('<command> [key]')
  .description('Run a specific command', {
    command: 'The command to execute (get-repo, get-all-repos, reset-timer)',
    key: 'The key for the "get-repo" command (optional)',
  })
  .action((command, key) => {
    handleCommand(command, key);
  });

program.parse(process.argv);