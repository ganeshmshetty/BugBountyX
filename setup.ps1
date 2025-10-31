# BugBountyX Setup Script for Windows
# Run this with: .\setup.ps1

Write-Host "🐛 BugBountyX Setup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm installed: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm not found. Installing globally..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpm installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
Write-Host "📦 Installing root project dependencies..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install web dependencies
Write-Host "📦 Installing web frontend dependencies..." -ForegroundColor Cyan
Set-Location web
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install web dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow

# Check if .env exists in root
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env - Please edit and add your private key!" -ForegroundColor Green
} else {
    Write-Host "✅ Root .env already exists" -ForegroundColor Green
}

# Check if web/.env exists
if (-not (Test-Path "web\.env")) {
    Write-Host "⚠️  Creating web/.env file from template..." -ForegroundColor Yellow
    Copy-Item "web\.env.example" "web\.env"
    Write-Host "✅ Created web/.env - Please add your WalletConnect Project ID!" -ForegroundColor Green
} else {
    Write-Host "✅ Web .env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Compiling smart contract..." -ForegroundColor Yellow
pnpm compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Smart contract compiled successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to compile smart contract" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file and add your private key and curator address" -ForegroundColor White
Write-Host "2. Get testnet MATIC from https://faucet.polygon.technology/" -ForegroundColor White
Write-Host "3. Deploy contract: pnpm deploy:amoy" -ForegroundColor White
Write-Host "4. Edit web/.env and add the deployed contract address" -ForegroundColor White
Write-Host "5. Get WalletConnect ID from https://cloud.walletconnect.com/" -ForegroundColor White
Write-Host "6. Run frontend: cd web && pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 See SETUP_GUIDE.md for detailed instructions" -ForegroundColor Cyan
