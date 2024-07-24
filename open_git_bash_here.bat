@echo off
setlocal enabledelayedexpansion
set cmd="%CD%"
set cmd=!cmd:\=\\!
start "" "C:\Program Files\Git\git-bash.exe" --cd=!cmd!
