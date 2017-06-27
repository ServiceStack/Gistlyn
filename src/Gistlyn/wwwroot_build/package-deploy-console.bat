@echo off
SET STAGING=staging-console

IF EXIST %STAGING%\ (
REM RMDIR /S /Q .\%STAGING%
) ELSE IF EXIST %STAGING% (
REM DEL /s %STAGING%
)

REM MD %STAGING%

SET TOOLS=.\tools
SET OUTPUTNAME=Gistlyn-console.exe

SET RELEASE=..\..\Gistlyn.AppConsole\bin\Release

IF NOT EXIST apps\console\bin (
	MD apps\console\bin
)
IF NOT EXIST apps\console\bin\x86 (
	MD apps\console\bin\x86
)
IF NOT EXIST apps\console\bin\x64 (
	MD apps\console\bin\x64
)

REM COPY /Y .\%STAGING%\%OUTPUTNAME% .\apps\
COPY /Y .\%RELEASE%\*.* .\apps\console\bin\
COPY /Y .\%RELEASE%\x86\*.* .\apps\console\bin\x86\
COPY /Y .\%RELEASE%\x64\*.* .\apps\console\bin\x64\
COPY .\deploy_console\*.* .\apps\console\
COPY .\deploy_console\bin\*.* .\apps\console\bin\

DEL .\apps\Gistlyn-console.zip
%TOOLS%\7za a .\apps\Gistlyn-console.zip .\apps\console\*

echo ------------- && echo  deployed to: .\wwwroot_build\apps\console && echo -------------
