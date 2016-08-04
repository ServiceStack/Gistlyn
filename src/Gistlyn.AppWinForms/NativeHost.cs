using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms.Internals;
using ServiceStack.Configuration;
using ServiceStack.Text;
using Squirrel;

namespace Gistlyn.AppWinForms
{
    public class NativeHost
    {
        private readonly FormMain formMain;

        public NativeHost(FormMain formMain)
        {
            this.formMain = formMain;

            //Enable Chrome Dev Tools when debugging WinForms
            formMain.ChromiumBrowser.KeyboardHandler = new KeyboardHandler();
        }

        public string Platform
        {
            get { return "winforms"; }
        }

        public void Quit()
        {
            formMain.InvokeOnUiThreadIfRequired(() =>
            {
                formMain.Close();
            });
        }

        public void ShowAbout()
        {
            MessageBox.Show(@"ServiceStack Winforms with CefSharp + React", @"Gistlyn.AppWinForms", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        public void ToggleFormBorder()
        {
            formMain.InvokeOnUiThreadIfRequired(() =>
            {
                formMain.FormBorderStyle = formMain.FormBorderStyle == FormBorderStyle.None
                    ? FormBorderStyle.Sizable
                    : FormBorderStyle.None;
            });
        }

        public void Ready()
        {
            //Invoke on DOM ready
            var appSettings = new AppSettings();
            var checkForUpdates = appSettings.Get<bool>("EnableAutoUpdate");
            if (!checkForUpdates)
                return;

            var releaseFolderUrl = appSettings.GetString("UpdateManagerUrl");
            try
            {
                var updatesAvailableTask = AppUpdater.CheckForUpdates(releaseFolderUrl);
                updatesAvailableTask.ContinueWith(isAvailable =>
                {
                    isAvailable.Wait(TimeSpan.FromMinutes(1));
                    bool updatesAvailable = isAvailable.Result;
                    //Only check once one launch then release UpdateManager.
                    if (!updatesAvailable)
                    {
                        AppUpdater.Dispose();
                        return;
                    }
                    if (formMain == null)
                    {
                        return;
                    }
                    // Notify web client updates are available.
                    formMain.InvokeOnUiThreadIfRequired(() =>
                    {
                        formMain.ChromiumBrowser.GetMainFrame().ExecuteJavaScriptAsync("window.updateAvailable();");
                    });
                });
            }
            catch (Exception e)
            {
                // Error reaching update server
            }
        }

        public void PerformUpdate()
        {
            AppUpdater.ApplyUpdates(new AppSettings().GetString("UpdateManagerUrl")).ContinueWith(t =>
            {
                formMain.InvokeOnUiThreadIfRequired(() =>
                {
                    formMain.Close();
                    Cef.Shutdown();
                    UpdateManager.RestartApp();
                });
            });
        }
    }

    public class KeyboardHandler : CefSharp.IKeyboardHandler
    {
        readonly Stopwatch stopwatch = Stopwatch.StartNew();

        public bool OnPreKeyEvent(IWebBrowser browserControl, IBrowser browser, KeyType type, int key, int nativeKeyCode,
            CefEventFlags modifiers, bool isSystemKey, ref bool isKeyboardShortcut)
        {
            if (key == (int)Keys.F12)
            {
                Program.Form.ChromiumBrowser.ShowDevTools();
            }

            //Mute beep for known keyboard shortcuts
            if (modifiers == CefEventFlags.ControlDown)
            {
                if (key == (int) Keys.R)
                    Program.Form.ChromiumBrowser.Reload();

                if (key == (int)Keys.W)
                    Program.Form.Close();

                if (key == (int)Keys.S || key == (int)Keys.Enter || key == (int)Keys.Left || key == (int)Keys.Right)
                    return false;
            }

            if (modifiers == CefEventFlags.AltDown)
            {
                //Implement Back/Forward
                if (key == (int) Keys.Left || key == (int) Keys.Right)
                {
                    //Hack to prevent ALT + LEFT/RIGHT double firing/navigating when it was only pressed once
                    if (stopwatch.ElapsedMilliseconds > 100) 
                    {
                        if (key == (int)Keys.Left && Program.Form.ChromiumBrowser.CanGoBack)
                            Program.Form.ChromiumBrowser.Back();

                        if (key == (int)Keys.Right && Program.Form.ChromiumBrowser.CanGoForward)
                            Program.Form.ChromiumBrowser.Forward();

                        Thread.Sleep(10);
                    }

                    stopwatch.Reset();
                    stopwatch.Start();
                    return false;
                }

                if (key == (int)Keys.S || key == (int)Keys.C)
                    return false;
            }

            if (key == (int)Keys.Escape || key == (int)Keys.OemQuestion || key == (int)Keys.F11 || key == (int)Keys.F4)
                return false;

            return isSystemKey;
        }

        public bool OnKeyEvent(IWebBrowser browserControl, IBrowser browser, KeyType type, int windowsKeyCode, int nativeKeyCode,
            CefEventFlags modifiers, bool isSystemKey)
        {
            return false;
        }
    }
}
