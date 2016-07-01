using System;
using CoreGraphics;
using Foundation;
using AppKit;
using ObjCRuntime;

namespace Gistlyn.AppMac
{
	public static class Program
	{
		public static string HostUrl = "http://localhost:2337/";

		public static AppHost App;
		public static NSMenu MainMenu;

		static void Main (string[] args)
		{
			App = new AppHost();
			App.Init().Start("http://*:2337/");

			NSApplication.Init();
			NSApplication.Main(args);
		}
	}
}

