# Test PostgreSQL Connection dengan berbagai password

$passwords = @("admin", "admin123", "postgres", "password", "root", "123456", "")

foreach ($pwd in $passwords) {
    Write-Host "`nTesting password: '$pwd'" -ForegroundColor Yellow
    
    $env:DATABASE_URL = "postgresql://postgres:$pwd@localhost:5432/garment_production?schema=public"
    
    $result = npx prisma db pull 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS! Password is: '$pwd'" -ForegroundColor Green
        Write-Host "`nUpdate your .env file with:" -ForegroundColor Cyan
        Write-Host "DATABASE_URL=`"postgresql://postgres:$pwd@localhost:5432/garment_production?schema=public`"" -ForegroundColor White
        break
    } else {
        Write-Host "Failed with password: '$pwd'" -ForegroundColor Red
    }
}
