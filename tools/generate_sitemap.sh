#!/bin/bash
# Description: Checks for staged HTML files and regenerates sitemap if found.

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check for staged HTML files
# We look for .html files in the staged area
if git diff --cached --name-only | grep "\.html$"; then
    echo -e "${GREEN}HTML changes detected. Regenerating sitemap...${NC}"
    
    # Run static-sitemap-cli
    # -b: Base URL
    # -r: Root directory to scan
    if npx static-sitemap-cli -b https://tools.passkeys.dev -r public/; then
        echo -e "${GREEN}Sitemap generated successfully.${NC}"
        # Add the generated sitemap back to the commit
        git add public/sitemap.xml
    else
        echo "Error: Failed to generate sitemap."
        exit 1
    fi
fi
