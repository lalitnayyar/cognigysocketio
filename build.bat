@echo off
IF NOT EXIST dist mkdir dist
xcopy /E /I /Y public\* dist\
echo /* /index.html 200 > dist\_redirects
