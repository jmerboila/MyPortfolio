@echo off
REM ============================================================
REM  preview.cmd - view this site locally, exactly as it will
REM  behave on GitHub Pages. Just double-click this file.
REM  Close the black window when you are done.
REM ============================================================
cd /d "%~dp0"
set PORT=8000

echo.
echo   Starting local preview of your portfolio...
echo.

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" http://localhost:%PORT%/
  echo   Open in your browser:  http://localhost:%PORT%/
  echo   Press Ctrl+C to stop.
  py -m http.server %PORT%
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" http://localhost:%PORT%/
  echo   Open in your browser:  http://localhost:%PORT%/
  echo   Press Ctrl+C to stop.
  python -m http.server %PORT%
  goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL%==0 (
  echo   Using Node. First run may take a moment to fetch the server.
  npx --yes serve -l %PORT% .
  goto :eof
)

echo   Could not find Python or Node on this machine.
echo   Install Python from https://python.org (tick "Add to PATH"),
echo   or just push to GitHub and view the live site.
echo.
pause
