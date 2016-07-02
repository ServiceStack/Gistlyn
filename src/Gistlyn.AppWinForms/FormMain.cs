using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using CefSharp.WinForms.Internals;

namespace Gistlyn.AppWinForms
{
    public partial class FormMain : Form
    {
        public ChromiumWebBrowser ChromiumBrowser { get; private set; }
        public FormMain()
        {
            InitializeComponent();
            VerticalScroll.Visible = false;

            ChromiumBrowser = new ChromiumWebBrowser(Program.HostUrl)
            {
                Dock = DockStyle.Fill
            };

            Controls.Add(ChromiumBrowser);

            Load += (sender, args) =>
            {
                FormBorderStyle = FormBorderStyle.Sizable;
                Left = (int) (Screen.PrimaryScreen.WorkingArea.Width * .1);
                Top = (int)(Screen.PrimaryScreen.WorkingArea.Height * .1);
                Width = (int) (Screen.PrimaryScreen.WorkingArea.Width * .8);
                Height = (int) (Screen.PrimaryScreen.WorkingArea.Height * .8);
            };

            ChromiumBrowser.RegisterJsObject("nativeHost", new NativeHost(this));
        }
    }
}
