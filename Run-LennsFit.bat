@echo off
title LennsFit Portable
echo Launching LennsFit Health Vitals Software...
set "DIR=%~dp0"
set "INDEX=%DIR%dist\index.html"
if exist "%INDEX%" (
  start msedge --app="file:///%INDEX:\=/%"
) else (
  echo Building bundle...
  call npm run build
  if exist "%INDEX%" (
    start msedge --app="file:///%INDEX:\=/%"
  ) else (
    echo Error: Could not locate dist/index.html
    pause
  )
)
