rmdir packages /s /q

nuget locals all -clear

del %LOCALAPPDATA%\NuGet\Cache\*.nupkg /q