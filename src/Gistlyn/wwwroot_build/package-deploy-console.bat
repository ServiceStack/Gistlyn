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
SET ILMERGE=%TOOLS%\ILMerge.exe
SET ILMERGE=%TOOLS%\ILRepack.exe

SET RELEASE=..\..\Gistlyn.AppConsole\bin\Release
SET INPUT=%RELEASE%\Gistlyn.AppConsole.exe
SET INPUT=%INPUT% %RELEASE%\Gistlyn.Resources.dll
SET INPUT=%INPUT% %RELEASE%\Gistlyn.ServiceInterface.dll
SET INPUT=%INPUT% %RELEASE%\Gistlyn.ServiceModel.dll
SET INPUT=%INPUT% %RELEASE%\Gistlyn.SnippetEngine.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Text.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Client.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Common.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Interfaces.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Server.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.OrmLite.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Redis.dll
SET INPUT=%INPUT% %RELEASE%\Microsoft.CodeAnalysis.CSharp.dll
SET INPUT=%INPUT% %RELEASE%\Microsoft.CodeAnalysis.CSharp.Scripting.dll
SET INPUT=%INPUT% %RELEASE%\Microsoft.CodeAnalysis.dll
SET INPUT=%INPUT% %RELEASE%\Microsoft.CodeAnalysis.Scripting.dll
SET INPUT=%INPUT% %RELEASE%\NuGet.Core.dll
SET INPUT=%INPUT% %RELEASE%\System.Collections.Immutable.dll
SET INPUT=%INPUT% %RELEASE%\System.IO.FileSystem.dll
SET INPUT=%INPUT% %RELEASE%\System.IO.FileSystem.Primitives.dll
SET INPUT=%INPUT% %RELEASE%\System.Reflection.Metadata.dll

%ILMERGE% /target:exe /targetplatform:v4,"C:\Program Files (x86)\Reference Assemblies\Microsoft\Framework\.NETFramework\v4.6" /out:%STAGING%\%OUTPUTNAME% /ndebug /copyattrs %INPUT% /lib:%RELEASE%


IF NOT EXIST apps (
MD apps
)

COPY /Y .\%STAGING%\%OUTPUTNAME% .\apps\

echo ------------- && echo  deployed to: .\wwwroot_build\apps\%OUTPUTNAME% && echo -------------
