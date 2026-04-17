package com.dominex.arena;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import java.util.Locale;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {

    // Current APK version — bump this with every new build
    private static final int    CURRENT_VERSION_CODE = 99;
    private static final String VERSION_CHECK_URL    = "https://www.ailurix.com/game-version.json";

    private WebView webView;

    private TextToSpeech tts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Init native TTS for announcer voice
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS) {
                    tts.setLanguage(Locale.US);
                    tts.setSpeechRate(0.72f);   // slower = more dramatic
                    tts.setPitch(0.5f);          // deep male announcer voice
                }
            }
        });

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );

        webView = new WebView(this);
        webView.setLayoutParams(new android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT
        ));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setDatabaseEnabled(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(false);
        }

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }
        });

        // Android TTS interface — replaces unreliable WebView SpeechSynthesis
        webView.addJavascriptInterface(new AndroidTTS(), "AndroidTTS");

        // Load mobile-optimized UI (Chrome keeps index.html, app uses index-mobile.html)
        webView.loadUrl("file:///android_asset/index-mobile.html");

        setContentView(webView);

        // Check for update in background (only if internet available)
        if (isOnline()) {
            new UpdateChecker().execute();
        }
    }

    // ── UPDATE CHECKER ──────────────────────────────────────────────
    private class UpdateChecker extends AsyncTask<Void, Void, JSONObject> {
        @Override
        protected JSONObject doInBackground(Void... voids) {
            try {
                URL url = new URL(VERSION_CHECK_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setRequestMethod("GET");
                if (conn.getResponseCode() != 200) return null;
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);
                br.close(); conn.disconnect();
                return new JSONObject(sb.toString());
            } catch (Exception e) { return null; }
        }

        @Override
        protected void onPostExecute(JSONObject json) {
            if (json == null) return;
            try {
                int    serverCode = json.getInt("versionCode");
                String serverName = json.getString("versionName");
                String apkUrl     = json.getString("apkUrl");
                String changelog  = json.optString("changelog", "");

                if (serverCode > CURRENT_VERSION_CODE) {
                    showUpdateDialog(serverName, apkUrl, changelog);
                }
            } catch (Exception e) { /* ignore */ }
        }
    }

    private void showUpdateDialog(String newVer, final String apkUrl, String changelog) {
        String msg = "Version " + newVer + " available!\n\n" + changelog + "\n\nDownload the new APK now?";
        new AlertDialog.Builder(this)
            .setTitle("🎮 Update Available")
            .setMessage(msg)
            .setCancelable(false)
            .setPositiveButton("DOWNLOAD", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                    startActivity(i);
                }
            })
            .setNegativeButton("Later", null)
            .show();
    }

    // ── HELPERS ─────────────────────────────────────────────────────
    private boolean isOnline() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            NetworkInfo ni = cm.getActiveNetworkInfo();
            return ni != null && ni.isConnectedOrConnecting();
        } catch (Exception e) { return false; }
    }

    @Override public void onBackPressed() { /* Block back button */ }

    // ── ANDROID TTS INTERFACE ────────────────────────────────────────
    // NOTE: @JavascriptInterface runs on BG thread — must runOnUiThread!
    private class AndroidTTS {
        @JavascriptInterface
        public void speak(final String text) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (tts == null) return;
                    try {
                        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "dnx_" + text.hashCode());
                    } catch (Exception e) {}
                }
            });
        }
        @JavascriptInterface
        public void stop() {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (tts != null) try { tts.stop(); } catch (Exception e) {}
                }
            });
        }
        @JavascriptInterface
        public boolean isReady() { return tts != null; }
    }

    @Override
    protected void onResume() {
        super.onResume();
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
