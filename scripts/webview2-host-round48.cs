// webview2-host-round48.cs — tabi round 48: a minimal WebView2 COM host.
//
// Why this exists (the r48 probe finding): msedgewebview2.exe launched
// standalone initializes a profile and then EXITS CLEANLY (code 0) within
// seconds — the embedded browser process keeps running only while a host
// application holds a CoreWebView2. The documented remote-debugging route
// (Microsoft Learn, "Debug WebView2 apps with VS Code" / CoreWebView2
// EnvironmentOptions.AdditionalBrowserArguments) therefore applies to the
// HOST: the host process is launched with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
// (carrying --remote-debugging-port=0) and WEBVIEW2_USER_DATA_FOLDER (the
// throwaway profile); the browser writes <profile>\DevToolsActivePort and the
// driver speaks CDP on that loopback port.
//
// This host: creates the environment from the FIXED-VERSION runtime folder
// (arg 1), loads the redistributable WebView2Loader.dll (arg 2), hosts one
// invisible 800x600 controller on a WinForms message loop, navigates it to
// the invocation-bound URL (arg 3), prints WEBVIEW2_HOST ready on stdout,
// and closes itself after --auto-close-ms (arg 4) — writing WEBVIEW2_HOST
// closing before exit so the driver can distinguish a clean host exit.
// Built with the Framework 4.8 C# 5 compiler (csc.exe), no NuGet: the COM
// interfaces below are declared from the SDK header WebView2.h vtable order
// (unused slots kept as stubs so offsets line up).
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.Threading;

namespace TabiWv2
{
    [ComImport, Guid("4e8a3389-c9d8-4bd2-b6b5-124fee6cc14d"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler
    {
        void Invoke(int errorCode, ICoreWebView2Environment environment);
    }

    [ComImport, Guid("6c4819f3-c9b7-4260-8127-c9f5bde7f68c"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface ICoreWebView2CreateCoreWebView2ControllerCompletedHandler
    {
        void Invoke(int errorCode, ICoreWebView2Controller controller);
    }

    // v1 environment: slot 0 = CreateCoreWebView2Controller(hwnd, handler)
    [ComImport, Guid("b96d755e-0319-4e92-a296-23436f46a1fc"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface ICoreWebView2Environment
    {
        void CreateCoreWebView2Controller(IntPtr hwnd, ICoreWebView2CreateCoreWebView2ControllerCompletedHandler handler);
        void CreateWebResourceResponse();
        void get_BrowserVersionString();
        void add_NewBrowserVersionAvailable();
        void remove_NewBrowserVersionAvailable();
    }

    // v1 controller vtable (WebView2.h): Close = slot 21, get_CoreWebView2 = 22
    [ComImport, Guid("4d00c0d1-9434-4eb6-8078-8697a560334f"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface ICoreWebView2Controller
    {
        void get_IsVisible();
        void put_IsVisible(int visible);
        void get_Bounds();
        void put_Bounds(RECT bounds);
        void get_ZoomFactor();
        void put_ZoomFactor();
        void add_ZoomFactorChanged();
        void remove_ZoomFactorChanged();
        void SetBoundsAndZoomFactor();
        void MoveFocus();
        void add_MoveFocusRequested();
        void remove_MoveFocusRequested();
        void add_GotFocus();
        void remove_GotFocus();
        void add_LostFocus();
        void remove_LostFocus();
        void add_AcceleratorKeyPressed();
        void remove_AcceleratorKeyPressed();
        void get_ParentWindow();
        void put_ParentWindow();
        void NotifyParentWindowPositionChanged();
        void Close();
        void get_CoreWebView2(out IntPtr webview);
    }

    // v1 webview: slot 2 = Navigate(LPCWSTR)
    [ComImport, Guid("76eceacb-0462-4d94-ac83-423a6793775e"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface ICoreWebView2
    {
        void get_Settings();
        void get_Source();
        void Navigate([MarshalAs(UnmanagedType.LPWStr)] string url);
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left; public int Top; public int Right; public int Bottom;
    }

    internal class EnvHandler : ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler
    {
        private readonly Action<ICoreWebView2Environment> cb;
        public EnvHandler(Action<ICoreWebView2Environment> callback) { cb = callback; }
        public void Invoke(int errorCode, ICoreWebView2Environment environment) { cb(environment); }
    }

    internal class CtlHandler : ICoreWebView2CreateCoreWebView2ControllerCompletedHandler
    {
        private readonly Action<ICoreWebView2Controller> cb;
        public CtlHandler(Action<ICoreWebView2Controller> callback) { cb = callback; }
        public void Invoke(int errorCode, ICoreWebView2Controller controller) { cb(controller); }
    }

    internal static class Host
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool SetDllDirectory(string path);

        private static Form form;
        private static int autoCloseMs;
        private static string url;

        [STAThread]
        private static int Main(string[] args)
        {
            if (args.Length < 4)
            {
                Console.Error.WriteLine("usage: webview2-host-round48 <runtimeFolder> <loaderDll> <url> <autoCloseMs>");
                return 2;
            }
            string runtimeFolder = args[0];
            string loaderDll = args[1];
            url = args[2];
            if (!int.TryParse(args[3], out autoCloseMs)) autoCloseMs = 30000;

            // The loader must be loadable; pin the directory so its own
            // dependencies resolve, then import by absolute path at run time.
            // (LoadLibrary with an absolute path does not need SetDllDirectory,
            // but pinning is harmless and keeps probe failures diagnosable.)
            if (!SetDllDirectory(System.IO.Path.GetDirectoryName(loaderDll)))
            {
                Console.Error.WriteLine("WEBVIEW2_HOST SetDllDirectory failed");
                return 3;
            }

            form = new Form();
            form.Text = "tabi-r48-webview2-host";
            form.Width = 800; form.Height = 600;
            form.ShowInTaskbar = false;
            form.FormBorderStyle = FormBorderStyle.FixedToolWindow;
            form.StartPosition = FormStartPosition.Manual;
            form.Location = new System.Drawing.Point(-32000, -32000); // offscreen
            form.AllowTransparency = false;

            // The loader requires the environment to be created on an STA
            // thread that pumps messages (the completion handler is dispatched
            // through that pump) — so create it here, on Main's STA thread,
            // before Application.Run starts the pump.
            Console.Out.WriteLine("WEBVIEW2_HOST starting");
            try
            {
                CreateEnvironment(runtimeFolder, loaderDll);
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("WEBVIEW2_HOST env-error " + e.GetType().Name + " " + e.Message);
                return 4;
            }

            var timer = new System.Windows.Forms.Timer();
            timer.Interval = autoCloseMs;
            timer.Tick += new EventHandler(delegate { CloseHost(null, null); });
            timer.Start();

            Application.Run(form);
            Console.Out.WriteLine("WEBVIEW2_HOST closing");
            return 0;
        }

        // Loader import is by absolute path, so it has to be wired at run time:
        // delegate to a small helper that LoadLibrary/GetProcAddress's the
        // entry point through Marshal.GetDelegateForFunctionPointer.
        [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Unicode)]
        private delegate void CreateEnvWithOptions(
            [MarshalAs(UnmanagedType.LPWStr)] string browserExecutableFolder,
            [MarshalAs(UnmanagedType.LPWStr)] string userDataFolder,
            IntPtr environmentOptions,
            ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler handler);

        private static void CreateEnvironment(string runtimeFolder, string loaderDll)
        {
            IntPtr lib = NativeLibrary.Load(loaderDll);
            IntPtr proc = NativeLibrary.GetProcedure(lib, "CreateCoreWebView2EnvironmentWithOptions");
            CreateEnvWithOptions create = (CreateEnvWithOptions)Marshal.GetDelegateForFunctionPointer(proc, typeof(CreateEnvWithOptions));
            string profile = Environment.GetEnvironmentVariable("WEBVIEW2_USER_DATA_FOLDER");
            // options = null: the additional browser arguments arrive via the
            // documented WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS env var.
            create(runtimeFolder, profile, IntPtr.Zero, new EnvHandler(new Action<ICoreWebView2Environment>(OnEnvironment)));
        }

        private static void OnEnvironment(ICoreWebView2Environment env)
        {
            if (env == null)
            {
                Console.Error.WriteLine("WEBVIEW2_HOST env-null (HRESULT from loader)");
                Environment.Exit(5);
            }
            // The handler fires on Main's STA thread (the loader dispatches
            // through the message pump), so no Invoke hop is needed.
            try
            {
                env.CreateCoreWebView2Controller(form.Handle, new CtlHandler(new Action<ICoreWebView2Controller>(OnController)));
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("WEBVIEW2_HOST ctl-request-error " + e.Message);
                Environment.Exit(6);
            }
        }

        private static void OnController(ICoreWebView2Controller ctl)
        {
            if (ctl == null)
            {
                Console.Error.WriteLine("WEBVIEW2_HOST ctl-null");
                Environment.Exit(7);
            }
            ctl.put_IsVisible(1); // the form itself is offscreen (-32000): rendering stays live for Page.captureScreenshot without anything appearing on the desktop
            RECT bounds = new RECT();
            bounds.Left = 0; bounds.Top = 0; bounds.Right = 800; bounds.Bottom = 600;
            ctl.put_Bounds(bounds);
            IntPtr wv;
            ctl.get_CoreWebView2(out wv);
            ICoreWebView2 webview = (ICoreWebView2)Marshal.GetObjectForIUnknown(wv);
            webview.Navigate(url);
            host = ctl;
            Console.Out.WriteLine("WEBVIEW2_HOST ready");
        }

        private static ICoreWebView2Controller host;

        private static void CloseHost(object sender, EventArgs e)
        {
            try
            {
                if (host != null) host.Close();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("WEBVIEW2_HOST close-error " + ex.Message);
            }
            if (form != null) form.Close();
        }
    }

    // Minimal LoadLibrary/GetProcAddress helper (no Dependency Injection text
    // bloat; keeps the C# 5 surface small).
    internal static class NativeLibrary
    {
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern IntPtr LoadLibraryW(string fileName);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Ansi)]
        private static extern IntPtr GetProcAddress(IntPtr module, string procName);

        public static IntPtr Load(string path)
        {
            IntPtr h = LoadLibraryW(path);
            if (h == IntPtr.Zero) throw new Exception("LoadLibrary failed for " + path + " win32=" + Marshal.GetLastWin32Error());
            return h;
        }
        public static IntPtr GetProcedure(IntPtr module, string name)
        {
            IntPtr p = GetProcAddress(module, name);
            if (p == IntPtr.Zero) throw new Exception("GetProcAddress failed for " + name);
            return p;
        }
    }
}
