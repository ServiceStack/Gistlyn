@echo off
SET STAGING=staging-console

IF EXIST %STAGING%\ (
RMDIR /S /Q .\%STAGING%
) ELSE IF EXIST %STAGING% (
REM DEL /s %STAGING%
)

REM MD %STAGING%

SET TOOLS=.\tools
SET OUTPUTNAME=Gistlyn-console.exe

SET RELEASE=..\..\Gistlyn.AppConsole\bin\Release

DEL apps\%OUTPUTNAME%
DEL libz\*.libz

COPY %RELEASE%\Gistlyn.AppConsole.exe %RELEASE%\%OUTPUTNAME%

REM %TOOLS%\libz.exe add --libz libz\System.libz --include %RELEASE%\System*.dll --safe-load
REM %TOOLS%\libz.exe add --libz libz\Microsoft.libz --include %RELEASE%\Microsoft*.dll --safe-load
REM %TOOLS%\libz.exe add --libz libz\ServiceStack.libz --include %RELEASE%\ServiceStack*.dll --safe-load
REM %TOOLS%\libz.exe add --libz libz\NuGet.libz --include %RELEASE%\NuGet*.dll --safe-load
REM %TOOLS%\libz.exe add --libz libz\Gistlyn.libz --include %RELEASE%\Gistlyn*.dll --safe-load

REM %TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\System.libz
REM %TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\Microsoft.libz
REM %TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\NuGet.libz
REM %TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\ServiceStack.libz
REM %TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\Gistlyn.libz

%TOOLS%\libz.exe add --libz libz\all.libz --include %RELEASE%\*.dll --safe-load
%TOOLS%\libz.exe inject-libz --assembly %RELEASE%\%OUTPUTNAME% --libz libz\all.libz

%TOOLS%\libz.exe instrument --assembly %RELEASE%\%OUTPUTNAME% --libz-resources

REM %TOOLS%\libz.exe inject-dll --assembly %RELEASE%\%OUTPUTNAME% --include %RELEASE%\*.dll --move

MOVE /Y %RELEASE%\%OUTPUTNAME% .\apps\

echo ------------- && echo  deployed to: .\wwwroot_build\apps\%OUTPUTNAME% && echo -------------