## Getting Started

### 1. Install `pnpm`

If you do not have `pnpm` installed, you can install it globally using npm (or brew):

```bash
npm install -g pnpm
```
### 2. Clone the Repository

Clone the repo:

```bash
git clone https://github.com/xinanrahman/credit-card-simulator.git
cd credit-card-simulator
```

### 3. Install Dependencies
Install the required dependencies using pnpm:
```bash
pnpm install
```

### 4. Environment Variables
You should receive the necessary environment variables in a .env via email. Once received, place the .env file at the root of the project directory.


### 5. Set Up Prisma
Initialize Prisma to set up your database schema:
```bash
pnpm db:push
```
You can also use Prisma Studio to visually manipulate the local database:
```bash
pnpm db:studio
```

### 6. Start the Development Server
```bash
pnpm dev
```
The application will be available at http://localhost:3000 or your default port for running apps locally.



