@echo off
taskkill /F /IM node.exe /FI "WINDOWTITLE eq next dev" 2>nul
