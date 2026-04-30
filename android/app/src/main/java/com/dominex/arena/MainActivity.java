package com.dominex.arena;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.media.MediaPlayer;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.SoundPool;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {

    // Current APK version — bump this with every new build
    private static final int    CURRENT_VERSION_CODE = 164;
    private static final String VERSION_CHECK_URL    = "https://www.ailurix.com/game-version.json";

    private WebView webView;
    private TextToSpeech tts;

    // SoundPool for instant, gesture-free voice playback
    private SoundPool mPool;
    private Map<String,Integer> mSoundIds = new HashMap<>();
    private Set<Integer> mLoaded = new HashSet<>();
    private static final String[] VOICES = {
        "v_round1","v_round2","v_round3","v_fight",
        "v_youwin","v_finishhim","v_flawless"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // CRITICAL: Make volume buttons control MEDIA (game audio) not ring/notification
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        // Request audio focus so our audio plays even if another app was using it
        try {
            AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    AudioFocusRequest req = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                        .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build())
                        .build();
                    am.requestAudioFocus(req);
                } else {
                    am.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
                }
            }
        } catch (Exception e) {}

        // Init SoundPool — preload all voice clips NOW, before any user interaction
        initSoundPool();

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
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
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

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }
        });

        // SoundPool + MediaPlayer interfaces
        webView.addJavascriptInterface(new SoundPlayer(), "AndroidAudio");
        // TTS interface
        webView.addJavascriptInterface(new AndroidTTS(), "AndroidTTS");

        // Load mobile-optimized UI (Chrome keeps index.html, app uses index-mobile.html)
        webView.loadUrl("file:///android_asset/index-mobile.html");

        setContentView(webView);

        // Request mic permission at runtime (Android 6+)
        if (Build.VERSION.SDK_INT >= 23) {
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 1001);
            }
        }

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

    // ── SOUNDPOOL INIT ────────────────────────────────────────────────
    private void initSoundPool() {
        try {
            AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            mPool = new SoundPool.Builder().setMaxStreams(4).setAudioAttributes(attrs).build();
            mPool.setOnLoadCompleteListener(new SoundPool.OnLoadCompleteListener() {
                @Override public void onLoadComplete(SoundPool sp, int id, int status) {
                    if (status == 0) mLoaded.add(id);
                }
            });
            for (String name : VOICES) {
                try {
                    AssetFileDescriptor afd = getAssets().openFd("voice/" + name + ".mp3");
                    int id = mPool.load(afd, 1);
                    mSoundIds.put(name, id);
                    afd.close();
                } catch (Exception e) {}
            }
        } catch (Exception e) {}
    }

    // ── NATIVE MEDIAPLAYER + SOUNDPOOL INTERFACE ───────────────────────
    private class SoundPlayer {
        @JavascriptInterface
        public void showToast(final String msg) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Play immediately via SoundPool (instant, no gesture restriction)
        @JavascriptInterface
        public void playVoice(final String name) {
            // name = 'v_round1', 'v_fight', etc. (key in mSoundIds)
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (mPool == null) return;
                    String key = name.contains("/") ? nameFromPath(name) : name;
                    Integer id = mSoundIds.get(key);
                    if (id != null && mLoaded.contains(id)) {
                        mPool.play(id, 1f, 1f, 1, 0, 1f);
                    } else {
                        // Fallback: MediaPlayer for files not in pool
                        playWithMediaPlayer(name.contains("/") ? name : "voice/" + key + ".mp3");
                    }
                }
            });
        }

        // Schedule voice playback after delayMs — called FROM gesture context, fires from Java
        @JavascriptInterface
        public void playVoiceDelayed(final String name, final long delayMs) {
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override public void run() {
                    if (mPool == null) return;
                    String key = name.contains("/") ? nameFromPath(name) : name;
                    Integer id = mSoundIds.get(key);
                    if (id != null && mLoaded.contains(id)) {
                        mPool.play(id, 1f, 1f, 1, 0, 1f);
                    } else {
                        playWithMediaPlayer(name.contains("/") ? name : "voice/" + key + ".mp3");
                    }
                }
            }, delayMs);
        }

        private String nameFromPath(String path) {
            // Extract 'v_round1' from 'voice/v_round1.mp3'
            String n = path.replaceAll(".*/", "").replaceAll("\\..*", "");
            return n;
        }

        private void playWithMediaPlayer(final String assetPath) {
            try {
                final MediaPlayer mp = new MediaPlayer();
                AssetFileDescriptor afd = getAssets().openFd(assetPath);
                mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
                mp.setVolume(1f, 1f);
                mp.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                    @Override public void onPrepared(MediaPlayer m) { m.start(); }
                });
                mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                    @Override public void onCompletion(MediaPlayer m) { m.release(); }
                });
                mp.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                    @Override public boolean onError(MediaPlayer m, int w, int e) { m.release(); return true; }
                });
                mp.prepareAsync();
            } catch (Exception e) {}
        }
    }

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
        // Resume WebView rendering (fixes black screen after background)
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
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
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
