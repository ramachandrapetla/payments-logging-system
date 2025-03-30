brew install postgresql

brew services start postgresql

createuser -s postgres
createdb payment_gateway

