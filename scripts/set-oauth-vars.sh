#!/bin/bash
# Po vytvoření OAuth app na https://railway.app/account/tokens spusť:
# ./scripts/set-oauth-vars.sh TVŮJ_CLIENT_ID TVŮJ_CLIENT_SECRET

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./scripts/set-oauth-vars.sh RAILWAY_CLIENT_ID RAILWAY_CLIENT_SECRET"
  echo "Hodnoty získej z https://railway.app/account/tokens (OAuth Application)"
  exit 1
fi

railway variables set RAILWAY_CLIENT_ID="$1" RAILWAY_CLIENT_SECRET="$2"
echo "Done. Railway provede redeploy automaticky."
